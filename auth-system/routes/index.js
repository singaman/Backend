const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const sessionRoutes = require('./sessions');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all API routes
router.use(rateLimiter.general);

// Route definitions
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sessions', sessionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

module.exports = router;
