const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/', testController.health);
router.post('/echo', testController.echo);
router.get('/env', testController.env);

module.exports = router;
