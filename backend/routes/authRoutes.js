const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// user registration
router.post('/register', authController.register);

// user login
router.post('/login', authController.login);

module.exports = router;