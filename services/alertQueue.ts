import { Queue } from 'bullmq';
import redis from '@/lib/redis';

export const ALERT_QUEUE_NAME = 'watchlist-alerts';

// Create a queue instance
export const alertQueue = new Queue(ALERT_QUEUE_NAME, {
    connection: redis,
});

/**
 * Enqueue a repeatable alert evaluation task.
 * Evaluates the alert every 60 seconds until it fires or is cancelled.
 */
export async function scheduleAlertEvaluation(alertId: string) {
    // Use a repeatable job keyed by alertId pattern so we can remove it later
    const jobId = `alert-eval-${alertId}`;
    return alertQueue.add(
        'evaluate-alert',
        { alertId },
        {
            jobId,                          // Stable jobId makes lookup easy
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
            repeat: {
                every: 60_000,              // Re-evaluate every 60 seconds
                limit: 1440,               // Max: 24h worth of checks (safety ceiling)
            },
        }
    );
}

/**
 * Cancel a repeatable alert evaluation (call when alert is triggered or paused).
 */
export async function cancelAlertEvaluation(alertId: string) {
    try {
        const jobId = `alert-eval-${alertId}`;
        // Remove all repeatable jobs matching this key
        const repeatableJobs = await alertQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            if (job.id === jobId || job.name === 'evaluate-alert') {
                // Check if this repeatable entry matches our alertId through jobId pattern
                if (job.id && job.id.includes(alertId)) {
                    await alertQueue.removeRepeatableByKey(job.key);
                    console.log(`[AlertQueue] Cancelled repeatable job for alert ${alertId}`);
                }
            }
        }
    } catch (err: any) {
        console.error(`[AlertQueue] Failed to cancel repeatable job for alert ${alertId}: ${err.message}`);
    }
}
