const express = require('express');
const router = express.Router();

//Controller
const AuthenController = require('../controllers/AuthenController');

//Routes
router.post('/register', AuthenController.register);
router.post('/login', AuthenController.loginLocal);
router.post('/login/google', AuthenController.loginGoogle);
router.post('/login/github', AuthenController.loginGithub);
router.post('/login/facebook', AuthenController.loginFacebook);
router.get('/refreshToken', AuthenController.requestRefreshToken);
router.get('/logout', AuthenController.logout);
router.get('/github/callback', AuthenController.githubCallback);

module.exports = router;
