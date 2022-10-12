const express = require('express');
const router = express.Router();

//Controller
const AuthenController = require('../controllers/AuthenController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');
const RateLimitMiddleware = require('../middlewares/RateLimitMiddleware');

//Routes
router.post('/register', AuthenController.register);
router.post('/login', AuthenController.loginLocal);
router.post('/login/google', AuthenController.loginGoogle);
router.post('/login/github', AuthenController.loginGithub);
router.post('/login/facebook', AuthenController.loginFacebook);
router.get('/refreshToken', AuthenController.requestRefreshToken);
router.get('/logout', AuthenController.logout);
router.get('/github/callback', AuthenController.githubCallback);
router.post(
  '/code/email',
  RateLimitMiddleware.sendCodeViaEmail,
  AuthenController.sendCodeViaEmail,
);
router.post('/verify/code', AuthenController.verifyCodeViaEmail);
router.post('/recover/password', AuthenController.changePasswordWithCodeVia);
router.get(
  '/verify/email',
  AuthenMiddleware.verifyToken,
  AuthenController.verifyEmail,
);
router.get('/confirmation/:tokenEmail', AuthenController.confirmation);

module.exports = router;
