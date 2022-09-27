const AuthenController = require('../controllers/AuthenController');
const UserGithub = require('../models/UserGithub');

const GithubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const passportConfig = (passport) => {
  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
      },
      function (accessToken, refreshToken, profile, done) {
        AuthenController.loginGithub(profile, done);
      },
    ),
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      function (accessToken, refreshToken, profile, done) {
        AuthenController.loginGoogle(profile, done);
      },
    ),
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/auth/facebook/callback',
      },
      function (accessToken, refreshToken, profile, done) {
        console.log('profile: ', profile);
        AuthenController.loginFacebook(profile, done);
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

module.exports = passportConfig;
