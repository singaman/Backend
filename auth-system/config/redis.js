const redis = require('redis');

// Prefer a URL when a password is provided (handles ACL/username/password and node-redis v4 behavior)
let redisOptions = {};
if (process.env.REDIS_URL) {
  redisOptions.url = process.env.REDIS_URL;
} else if (process.env.REDIS_PASSWORD) {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || 6379;
  // If ACL username is provided include it before the password
  const usernamePart = process.env.REDIS_USERNAME ? `${encodeURIComponent(process.env.REDIS_USERNAME)}:` : '';
  redisOptions.url = `redis://${usernamePart}${encodeURIComponent(process.env.REDIS_PASSWORD)}@${host}:${port}`;
} else {
  redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  };
}

const redisClient = redis.createClient(redisOptions);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

// Connect to Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;
