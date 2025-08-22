const sequelize = require('../config/database');
const User = require('./User');
const DeviceSession = require('./DeviceSession');

// Define associations
User.hasMany(DeviceSession, {
  foreignKey: 'userId',
  as: 'deviceSessions',
  onDelete: 'CASCADE'
});

DeviceSession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  DeviceSession
};
