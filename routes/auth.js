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

router.post('/send/code', RateLimitMiddleware.sendCodeViaEmail, AuthenController.sendCodeViaEmail);
router.post('/confirmation/code', AuthenController.confirmCodeViaEmail);

router.post('/recover/password', AuthenController.changePasswordWithCodeVia);

router.get(
  '/send/emailVerify',
  AuthenMiddleware.verifyToken,
  AuthenController.sendVerificationEmail,
);
router.get('/confirmation/emailVerify/:tokenEmail', AuthenController.confirmVerificationEmail);

module.exports = router;
