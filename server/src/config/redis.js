import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('❌ Redis connection refused');
      return new Error('Redis connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

client.on('connect', () => {
  console.log('✅ Redis connected');
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Cache helper
export const cache = {
  async set(key, value, ttl = 3600) {
    return client.set(key, JSON.stringify(value), 'EX', ttl);
  },
  async get(key) {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },
  async del(key) {
    return client.del(key);
  },
  async flush() {
    return client.flushall();
  },
};

export default client;