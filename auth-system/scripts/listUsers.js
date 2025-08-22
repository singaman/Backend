// Simple script to list users from the database (safe fields only)
require('dotenv').config();
const { sequelize, User } = require('../models');

async function listUsers() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('Found', users.length, 'users');
    users.forEach(u => {
      const { password, emailVerificationToken, ...safe } = u.toJSON();
      console.log(safe);
    });
  } catch (err) {
    console.error('Error listing users:', err);
  } finally {
    await sequelize.close();
  }
}

listUsers();
