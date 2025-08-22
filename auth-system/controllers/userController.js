// User management logic
const { User } = require('../models');

module.exports = {
  // GET /users/me - return the authenticated user's profile
  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
};
