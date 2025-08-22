const bcrypt = require('bcryptjs');
const { User, DeviceSession } = require('../models');
const tokenService = require('./tokenService');
const deviceService = require('./deviceService');
const { emailQueue } = require('../queues');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Queue welcome email
    await emailQueue.add('welcome', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName
    });

    return user.toSafeObject();
  }

  async login(loginData, requestInfo) {
    const { email, password, deviceInfo } = loginData;
    const { userAgent, ipAddress } = requestInfo;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Handle device restriction
    await deviceService.handleDeviceRestriction(user.id);

    // Create new device session
    const deviceId = deviceService.generateDeviceId(userAgent, ipAddress);
    const deviceSession = await deviceService.createDeviceSession({
      userId: user.id,
      deviceId,
      deviceInfo,
      ipAddress,
      userAgent
    });

    // Generate tokens
    const tokens = tokenService.generateTokens(user.id, deviceId);

    // Store tokens
    await tokenService.storeTokens(user.id, deviceId, tokens);

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    return {
      user: user.toSafeObject(),
      tokens,
      deviceId
    };
  }

  async logout(userId, deviceId, accessToken) {
    // Blacklist current token
    await tokenService.blacklistToken(accessToken);

    // Remove session tokens
    await tokenService.removeTokens(userId, deviceId);

    // Deactivate device session
    await deviceService.deactivateSession(userId, deviceId);
  }

  async refreshTokens(refreshToken, deviceId) {
    const decoded = await tokenService.verifyRefreshToken(refreshToken);
    
    // Verify stored token
    const isValid = await tokenService.verifyStoredRefreshToken(
      decoded.userId, 
      deviceId, 
      refreshToken
    );

    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    // Check device session
    const session = await deviceService.getActiveSession(decoded.userId, deviceId);
    if (!session) {
      throw new Error('Device session expired');
    }

    // Generate new tokens
    const newTokens = tokenService.generateTokens(decoded.userId, deviceId);

    // Store new tokens
    await tokenService.storeTokens(decoded.userId, deviceId, newTokens);

    return newTokens;
  }
}

module.exports = new AuthService();
