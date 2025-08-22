const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redisClient = require('../config/redis');

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXP || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || 60 * 60 * 24 * 30; // 30 days in seconds

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateTokens: (userId, deviceId) => {
    const payload = { userId, deviceId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXP });
    const refreshToken = crypto.randomBytes(64).toString('hex');
    return { accessToken, refreshToken };
  },

  storeTokens: async (userId, deviceId, tokens) => {
    const key = `refresh:${userId}:${deviceId}`;
    const hashed = hashToken(tokens.refreshToken);
    // store hashed refresh token with TTL
    await redisClient.set(key, hashed, { EX: Number(REFRESH_TTL) });
  },

  blacklistToken: async (accessToken) => {
    try {
      const decoded = jwt.decode(accessToken);
      if (!decoded || !decoded.exp) return;
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl <= 0) return;
      const key = `blacklist:${accessToken}`;
      await redisClient.set(key, '1', { EX: ttl });
    } catch (err) {
      console.error('Error blacklisting token', err.message || err);
    }
  },

  removeTokens: async (userId, deviceId) => {
    const key = `refresh:${userId}:${deviceId}`;
    await redisClient.del(key);
  },

  verifyRefreshToken: async (refreshToken) => {
    try {
      // For our opaque refresh token, we don't sign it; just return null-decoded structure
      // We will rely on stored hashed token to verify.
      // In some flows you might include userId/deviceId in token, but here it's opaque and verified against Redis key.
      return { token: refreshToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  },

  verifyStoredRefreshToken: async (userId, deviceId, refreshToken) => {
    const key = `refresh:${userId}:${deviceId}`;
    const stored = await redisClient.get(key);
    if (!stored) return false;
    const hashed = hashToken(refreshToken);
    return stored === hashed;
  }
};
