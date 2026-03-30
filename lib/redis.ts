import { Redis } from 'ioredis';
const rawRedisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Construct explicit URL for better compatibility
let finalRedisUrl = rawRedisUrl;
if (process.env.REDIS_PASSWORD) {
    const user = process.env.REDIS_USER || 'default';
    // Remove protocol if exists to rebuild it
    const hostPort = rawRedisUrl.replace(/^rediss?:\/\//, '');
    finalRedisUrl = `redis://${user}:${process.env.REDIS_PASSWORD}@${hostPort}`;
} else if (!rawRedisUrl.startsWith('redis://') && !rawRedisUrl.startsWith('rediss://')) {
    finalRedisUrl = `redis://${rawRedisUrl}`;
}

const redis = new Redis(finalRedisUrl, {
    maxRetriesPerRequest: null,
    connectTimeout: 20000,
    commandTimeout: 15000,
    retryStrategy: (times) => {
        const delay = Math.min(times * 200, 10000); // More relaxed retry
        return delay;
    },
    enableReadyCheck: true,
    enableOfflineQueue: true,
    lazyConnect: true,
});

// Detailed error logging
redis.on('connect', () => console.log('Redis connected successfully.'));
redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
        console.error('Check if Redis is running and the port is open.');
    }
});

export default redis;
