import { Queue } from 'bullmq';
import redis from '@/lib/redis';

export const ALERT_QUEUE_NAME = 'watchlist-alerts';

// Create a queue instance
export const alertQueue = new Queue(ALERT_QUEUE_NAME, {
    connection: redis,
});

/**
 * Enqueue an alert evaluation task.
 */
export async function scheduleAlertEvaluation(alertId: string) {
    // We add a job with the alertId to process
    return alertQueue.add('evaluate-alert', { alertId }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false
    });
}
