const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceSession = sequelize.define('DeviceSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  deviceInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'isActive']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = DeviceSession;
