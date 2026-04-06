'use strict';

const Redis = require('ioredis');

let redis;

async function connectRedis() {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => console.log('✅ Redis connected'));
    redis.on('error', (err) => console.error('❌ Redis error:', err.message));
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    process.exit(1);
  }
}

function getRedis() {
  if (!redis) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redis;
}

module.exports = { connectRedis, getRedis };
