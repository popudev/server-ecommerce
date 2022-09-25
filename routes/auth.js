const express = require('express');
const router = express.Router();
const passport = require('passport');

//Controller
const AuthenController = require('../controllers/AuthenController');

//Routes
router.post('/register', AuthenController.register);
router.post('/login', AuthenController.login);
router.get('/refreshToken', AuthenController.requestRefreshToken);
router.get('/logout', AuthenController.logout);

router.get('/github', passport.authenticate('github', { scope: ['profile'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: 'http://localhost:3000',
    failureRedirect: '/login/failed',
  }),
);

module.exports = router;
