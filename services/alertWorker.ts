import { Worker, Job } from 'bullmq';
import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { ALERT_QUEUE_NAME } from './alertQueue';
import axios from 'axios';

// Simple mock for delivery
async function deliverNotification(userId: string, title: string, message: string) {
    console.log(`[Push/Email Stub] Delivering to ${userId}: ${title} - ${message}`);
    // In production, this would call Novu, Twilio, Resend, or Web-Push
}

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
