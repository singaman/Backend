const authService = require('../services/authService');
const { validateRegistration, validateLogin } = require('../utils/validation');

class AuthController {
  async register(req, res, next) {
    try {
      const { error } = validateRegistration(req.body);
      if (error) {
        return res.status(400).json({ 
          error: error.details[0].message 
        });
      }

      const user = await authService.register(req.body);

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { error } = validateLogin(req.body);
      if (error) {
        return res.status(400).json({ 
          error: error.details[0].message 
        });
      }

      const requestInfo = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      };

      const result = await authService.login(req.body, requestInfo);

      res.json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { userId, deviceId } = req.user;
      const token = req.headers['authorization'].split(' ')[1];

      await authService.logout(userId, deviceId, token);

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken, deviceId } = req.body;

      if (!refreshToken || !deviceId) {
        return res.status(400).json({ 
          error: 'Refresh token and device ID required' 
        });
      }

      const tokens = await authService.refreshTokens(refreshToken, deviceId);

      res.json(tokens);
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();
