const express = require('express');
const router = express.Router();

//Controller
const AuthenController = require('../controllers/AuthenController');

//Routes
router.post('/register', AuthenController.register);
router.post('/login', AuthenController.login);
router.get('/refreshToken', AuthenController.requestRefreshToken);
router.get('/logout', AuthenController.logout);

module.exports = router;
