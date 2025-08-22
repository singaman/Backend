// Device management logic
const { DeviceSession } = require('../models');
const tokenService = require('./tokenService');

module.exports = {
  handleDeviceRestriction: async (userId) => {
    // Enforce single-device: deactivate any active sessions for this user
    const active = await DeviceSession.findAll({ where: { userId, isActive: true } });
    for (const s of active) {
      s.isActive = false;
      await s.save();
      // remove stored refresh token
      await tokenService.removeTokens(userId, s.deviceId);
    }
  },

  generateDeviceId: (userAgent, ipAddress) => {
    return require('uuid').v4();
  },

  createDeviceSession: async (sessionData) => {
    const { userId, deviceId, deviceInfo, ipAddress, userAgent } = sessionData;
    const expiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const session = await DeviceSession.create({
      userId,
      deviceId,
      deviceInfo: deviceInfo || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      isActive: true,
      lastActivity: new Date(),
      expiresAt
    });
    return session;
  },

  deactivateSession: async (userId, deviceId) => {
    const session = await DeviceSession.findOne({ where: { userId, deviceId } });
    if (!session) return;
    session.isActive = false;
    await session.save();
    await tokenService.removeTokens(userId, deviceId);
  },

  getActiveSession: async (userId, deviceId) => {
    return DeviceSession.findOne({ where: { userId, deviceId, isActive: true } });
  }
};
