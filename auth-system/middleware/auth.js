const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const { DeviceSession } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check blacklist
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Verify device session
    const deviceSession = await DeviceSession.findOne({
      where: {
        userId: decoded.userId,
        deviceId: decoded.deviceId,
        isActive: true
      }
    });

    if (!deviceSession) {
      return res.status(401).json({ error: 'Device session expired' });
    }

    // Update last activity
    await deviceSession.update({ lastActivity: new Date() });

    req.user = {
      userId: decoded.userId,
      deviceId: decoded.deviceId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
