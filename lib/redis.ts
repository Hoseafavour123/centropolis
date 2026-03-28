import { Redis } from 'ioredis';

let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Ensure protocol exists for ioredis
if (redisUrl && !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    redisUrl = `redis://${redisUrl}`;
}

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    connectTimeout: 5000, // 5s timeout to avoid hanging indefinitely
});

export default redis;
