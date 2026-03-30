import { Worker, Job } from 'bullmq';
import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { ALERT_QUEUE_NAME } from './alertQueue';
import axios from 'axios';

// Simple mock for delivery
// Delivery function using the internal webhook
async function deliverNotification(userId: string, title: string, message: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await axios.post(`${baseUrl}/api/notifications/webhook`, {
            userId,
            title,
            message,
            type: 'ALARM'
        }, {
            headers: {
                'x-webhook-secret': process.env.WEBHOOK_SECRET
            }
        });
        console.log(`[AlertWorker] Notification delivered to ${userId}`);
    } catch (error) {
        console.error(`[AlertWorker] Failed to deliver notification to ${userId}:`, error);
    }
}

console.log(`[AlertWorker] Worker started and listening to queue: ${ALERT_QUEUE_NAME}`);

export const alertWorker = new Worker(ALERT_QUEUE_NAME, async (job: Job) => {
    const { alertId } = job.data;

    const alert = await prisma.alert.findUnique({
        where: { id: alertId },
        include: { watchlist: true }
    });

    if (!alert || alert.status !== 'ACTIVE') return;

    try {
        // Fetch current token price via DexScreener
        const { data } = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${alert.watchlist.address}`);
        const pairs = data.pairs || [];
        const bestPair = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

        if (!bestPair) return; // No liquidity/price found yet

        const currentPrice = parseFloat(bestPair.priceUsd);
        const threshold = alert.thresholdValue || 0;

        let triggered = false;
        let message = '';

        if (alert.type === 'PRICE_ABOVE' && currentPrice >= threshold) {
            triggered = true;
            message = `Price of ${bestPair.baseToken.symbol} just went above $${threshold} (Current: $${currentPrice})`;
        } else if (alert.type === 'PRICE_BELOW' && currentPrice <= threshold) {
            triggered = true;
            message = `Price of ${bestPair.baseToken.symbol} just dropped below $${threshold} (Current: $${currentPrice})`;
        }

        if (triggered) {
            // Mark alert as triggered
            await prisma.alert.update({
                where: { id: alertId },
                data: { status: 'TRIGGERED' }
            });

            // Deliver
            await deliverNotification(alert.userId, 'Watchlist Alert Triggered!', message);

            // Log analytics mock
            console.log(`[Analytics] alert_fired:`, { alertId, currentPrice, type: alert.type });
        } else {
            // Logic to re-enqueue if we want polling (but BullMQ repeatable jobs handle this better)
            // For now, if we use a cron to continuously add them, we just complete this instance.
        }
    } catch (error) {
        console.error(`Failed to process alert ${alertId}:`, error);
        throw error;
    }
}, { connection: redis });

alertWorker.on('completed', job => {
    console.log(`[AlertWorker] Job ${job.id} completed.`);
});

alertWorker.on('failed', (job, err) => {
    console.log(`[AlertWorker] Job ${job?.id} failed: ${err.message}`);
});
