import { Redis } from 'ioredis';

let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Ensure protocol exists for ioredis
if (redisUrl && !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    redisUrl = `redis://${redisUrl}`;
}

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, // Minimize build wait time
    retryStrategy: (times) => {
        // Stop retrying quickly during build if connection fails
        if (times > 1) return null;
        return 50;
    },
    enableReadyCheck: false,
    enableOfflineQueue: false,
    lazyConnect: true, // Don't connect until used
});

// Silence common build-time connection/auth errors
redis.on('error', (err) => {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        // Just log minimal info during build to keep output clean
        console.warn('[Redis Build Warning]', err.message);
    } else {
        console.error('Redis Error:', err);
    }
});

export default redis;
