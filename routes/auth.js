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

router.get('/login/success', AuthenController.loginThirdPartySuccess);

router.get('/github', passport.authenticate('github', { scope: ['profile'] }));
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: process.env.CLIENT_URL + '/login',
    failureRedirect: process.env.CLIENT_URL + '/login',
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL + '/login',
    failureRedirect: process.env.CLIENT_URL + '/login',
  }),
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: process.env.CLIENT_URL + '/login',
    failureRedirect: process.env.CLIENT_URL + '/login',
  }),
);

module.exports = router;
