// Session management logic
const { DeviceSession } = require('../models');

module.exports = {
  // GET /sessions - list active sessions for the authenticated user
  async listSessions(req, res, next) {
    try {
      const { userId } = req.user;
      const sessions = await DeviceSession.findAll({ where: { userId, isActive: true } });
      return res.json({ sessions });
    } catch (err) {
      next(err);
    }
  }
};
