// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: '/auth/google/callback',
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     },
//   ),
// );

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      console.log('vao 1');
      done(null, profile);
    },
  ),
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: FACEBOOK_APP_ID,
//       clientSecret: FACEBOOK_APP_SECRET,
//       callbackURL: '/auth/facebook/callback',
//     },
//     function (accessToken, refreshToken, profile, done) {
//       done(null, profile);
//     },
//   ),
// );

passport.serializeUser((user, done) => {
  console.log('vao 2');
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('vao 3');
  done(null, user);
});
