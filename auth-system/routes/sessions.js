const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

// Define session-related routes here
router.get('/', authenticateToken, sessionController.listSessions);

module.exports = router;
