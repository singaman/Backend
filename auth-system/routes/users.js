const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Define user-related routes here
router.get('/me', authenticateToken, userController.getProfile);

module.exports = router;
