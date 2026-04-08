import { Worker, Job } from 'bullmq';
import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { ALERT_QUEUE_NAME, cancelAlertEvaluation } from './alertQueue';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// External Notification Stubs (SMS / Email)
// Wire these up by adding TWILIO_ACCOUNT_SID / SENDGRID_API_KEY to .env.local
// ─────────────────────────────────────────────────────────────────────────────

async function sendSms(to: string, message: string): Promise<void> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;

    if (!sid || !token || !from) {
        console.log(`[NotificationDelivery] [SMS stub] Would send to ${to}: ${message}`);
        return;
    }

    try {
        await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
            new URLSearchParams({ To: to, From: from, Body: message }),
            { auth: { username: sid, password: token } }
        );
        console.log(`[NotificationDelivery] SMS sent to ${to}`);
    } catch (err: any) {
        console.error(`[NotificationDelivery] SMS failed: ${err.message}`);
    }
}

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@binocs.app';

    if (!apiKey) {
        console.log(`[NotificationDelivery] [Email stub] Would send to ${to}: ${subject}`);
        return;
    }

    try {
        await axios.post(
            'https://api.sendgrid.com/v3/mail/send',
            {
                personalizations: [{ to: [{ email: to }] }],
                from: { email: fromEmail },
                subject,
                content: [{ type: 'text/plain', value: body }],
            },
            { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        console.log(`[NotificationDelivery] Email sent to ${to}`);
    } catch (err: any) {
        console.error(`[NotificationDelivery] Email failed: ${err.message}`);
    }
}

/**
 * Full notification delivery pipeline:
 * 1. Write DB notification (feeds Navbar bell + Activity Feed)
 * 2. SMS stub (fires if TWILIO creds present)
 * 3. Email stub (fires if SENDGRID creds present)
 */
async function deliverNotification(
    userId: string,
    title: string,
    message: string
): Promise<void> {
    // 1. Write to DB via internal webhook — this updates the Navbar bell + Activity Feed
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await axios.post(
            `${baseUrl}/api/notifications/webhook`,
            { userId, title, message, type: 'ALARM' },
            { headers: { 'x-webhook-secret': process.env.WEBHOOK_SECRET } }
        );
        console.log(`[AlertWorker] In-app notification delivered to ${userId}`);
    } catch (err: any) {
        console.error(`[AlertWorker] Webhook delivery failed: ${err.message}`);
        // Fallback: write directly to DB if webhook is unreachable
        try {
            await prisma.notification.create({
                data: { userId, title, message, type: 'ALARM' }
            });
            console.log(`[AlertWorker] Fallback DB notification created for ${userId}`);
        } catch (dbErr: any) {
            console.error(`[AlertWorker] Fallback DB write failed: ${dbErr.message}`);
        }
    }

    // 2. Fetch user contact info for external delivery
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (user?.email) {
            // SMS stub (phone number not in schema yet — extend User model to add it)
            // sendSms(user.phone, message);  // Uncomment when phone field added

            // Email stub
            await sendEmail(user.email, `🔔 Binocs Alert: ${title}`, message);
        }
    } catch (err: any) {
        console.error(`[NotificationDelivery] External delivery error: ${err.message}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Alert Evaluation Logic
// ─────────────────────────────────────────────────────────────────────────────

console.log(`[AlertWorker] Worker started and listening to queue: ${ALERT_QUEUE_NAME}`);

export const alertWorker = new Worker(ALERT_QUEUE_NAME, async (job: Job) => {
    const { alertId } = job.data;

    const alert = await prisma.alert.findUnique({
        where: { id: alertId },
        include: { watchlist: true }
    });

    // Skip if already triggered or paused
    if (!alert || alert.status !== 'ACTIVE') {
        await cancelAlertEvaluation(alertId);
        return;
    }

    try {
        const { data } = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${alert.watchlist.address}`,
            { timeout: 10_000 }
        );
        const pairs: any[] = data.pairs || [];

        // ── VOLUME_SPIKE & AI_RISK_HIGH don't need a price pair ──
        if (alert.type === 'VOLUME_SPIKE') {
            const totalVolume = pairs.reduce((acc: number, p: any) => {
                return acc + ((p.volume?.h24 || 0));
            }, 0);
            const threshold = alert.thresholdValue || 0;
            if (totalVolume >= threshold) {
                await triggerAlert(alert, undefined, `24h volume spike detected for watchlisted token (volume: $${totalVolume.toLocaleString()})`);
            }
            return;
        }

        if (alert.type === 'AI_RISK_HIGH') {
            // Check sentinel score via internal API
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const sentinelRes = await axios.get(
                    `${baseUrl}/api/sentinel/score?address=${alert.watchlist.address}`,
                    { timeout: 15_000 }
                );
                const score: number = sentinelRes.data?.score ?? 100;
                const threshold = alert.thresholdValue ?? 30; // fire when score drops below threshold
                if (score <= threshold) {
                    await triggerAlert(alert, undefined, `Sentinel AI Risk score dropped to ${score}/100 for your watchlisted token`);
                }
            } catch (err: any) {
                console.warn(`[AlertWorker] Sentinel check failed: ${err.message}`);
            }
            return;
        }

        // ── PRICE_ABOVE / PRICE_BELOW ──
        const bestPair = pairs.sort(
            (a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
        )[0];

        if (!bestPair?.priceUsd) {
            console.warn(`[AlertWorker] No price data for alert ${alertId}`);
            return;
        }

        const currentPrice = parseFloat(bestPair.priceUsd);
        const threshold = alert.thresholdValue ?? 0;
        const symbol = bestPair.baseToken?.symbol ?? alert.watchlist.address.slice(0, 6);

        if (alert.type === 'PRICE_ABOVE' && currentPrice >= threshold) {
            await triggerAlert(
                alert,
                bestPair,
                `${symbol} price went above $${threshold.toLocaleString()} (current: $${currentPrice.toLocaleString()})`
            );
        } else if (alert.type === 'PRICE_BELOW' && currentPrice <= threshold) {
            await triggerAlert(
                alert,
                bestPair,
                `${symbol} price dropped below $${threshold.toLocaleString()} (current: $${currentPrice.toLocaleString()})`
            );
        }
    } catch (error: any) {
        console.error(`[AlertWorker] Failed to process alert ${alertId}: ${error.message}`);
        throw error; // Re-throw so BullMQ retries (up to 3 attempts per cycle)
    }
}, { connection: redis });

async function triggerAlert(alert: any, _pair: any, message: string) {
    // Mark as triggered in DB
    await prisma.alert.update({
        where: { id: alert.id },
        data: { status: 'TRIGGERED' }
    });

    // Stop the repeatable polling job
    await cancelAlertEvaluation(alert.id);

    // Full delivery: in-app bell + email/SMS stubs
    await deliverNotification(alert.userId, '🔔 Watchlist Alert Triggered!', message);

    console.log(`[AlertWorker] Alert ${alert.id} triggered and delivered.`);
}

alertWorker.on('completed', (job) => {
    console.log(`[AlertWorker] Job ${job.id} completed.`);
});

alertWorker.on('failed', (job, err) => {
    console.error(`[AlertWorker] Job ${job?.id} failed: ${err.message}`);
});
