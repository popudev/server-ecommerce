const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const passport = require('passport');
const UserGithub = require('../models/UserGithub');
const UserGoogle = require('../models/UserGoogle');
const UserFacebook = require('../models/UserFacebook');

const dev = process.env.NODE_ENV !== 'production';

const AuthenController = {
  setCookie: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
      // Since localhost is not having https protocol,
      // secure cookies do not work correctly (in postman)
      //SameSite is set to "None" since client and server will be in different domains.
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'none',
      maxAge: 60000 * 60 * 24 * 365,
    });
  },

  genarateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id, // id is String
        admin: user.admin,
        provider: user.provider,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '30s' },
    );
  },

  genarateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
        provider: user.provider,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '30d' },
    );
  },

  register: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const newUser = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        username: req.body.username,
        password: hashed,
      });

      const user = await newUser.save();
      const { username } = user._doc;

      res.status(200).json(username);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  login: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });

      if (!user)
        return res.status(404).json({
          key: 'username',
          mess: 'Username is not exist',
        });

      const match = await bcrypt.compare(req.body.password, user.password);

      if (match) {
        const accessToken = await AuthenController.loginSuccess(res, user);
        const { password, ...other } = user._doc;

        res.status(200).json({
          accessToken,
          ...other,
        });
      } else {
        res.status(404).json({
          key: 'password',
          mess: 'Incorrect password',
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  loginSuccess: async (res, user) => {
    const accessToken = AuthenController.genarateAccessToken(user);
    const refreshToken = AuthenController.genarateRefreshToken(user);

    const newToken = new RefreshToken({
      userId: user.id,
      refreshToken: refreshToken,
    });

    await newToken.save();
    AuthenController.setCookie(res, refreshToken);

    return accessToken;
  },

  loginGithub: async (profile, done) => {
    try {
      let userGithub = await UserGithub.findOne({ githubId: profile.id });

      if (!userGithub) {
        const newUserGithub = new UserGithub({
          username: profile.username,
          avatar: profile.photos && profile.photos[0].value,
          githubId: profile.id,
        });

        userGithub = await newUserGithub.save();
      }

      const userCurrent = {
        ...userGithub._doc,
        id: userGithub.id,
      };

      done(null, userCurrent);
    } catch (err) {
      done(err, false);
    }
  },

  loginGoogle: async (profile, done) => {
    try {
      let userGoogle = await UserGoogle.findOne({ googleId: profile.id });

      if (!userGoogle) {
        const newUserGoogle = new UserGoogle({
          username: profile.displayName,
          fullname: profile.displayName,
          avatar: profile.photos && profile.photos[0].value,
          googleId: profile.id,
        });

        userGoogle = await newUserGoogle.save();
      }

      const userCurrent = {
        ...userGoogle._doc,
        id: userGoogle.id,
      };

      done(null, userCurrent);
    } catch (err) {
      done(err, false);
    }
  },

  loginFacebook: async (profile, done) => {
    try {
      let userFacebook = await UserFacebook.findOne({ FacebookId: profile.id });

      if (!userFacebook) {
        const newUserFacebook = new UserFacebook({
          username: profile.displayName,
          fullname: profile.displayName,
          avatar: profile.photos && profile.photos[0].value,
          facebookId: profile.id,
        });

        userFacebook = await newUserFacebook.save();
      }

      const userCurrent = {
        ...userFacebook._doc,
        id: userFacebook.id,
      };

      done(null, userCurrent);
    } catch (err) {
      done(err, false);
    }
  },

  loginThirdPartySuccess: async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const accessToken = await AuthenController.loginSuccess(res, req.user);
        res.status(200).json({
          ...req.user,
          accessToken,
        });
      } else {
        res.status(401).json("You're not authenticated");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  requestRefreshToken: async (req, res) => {
    const refreshTokenRequest = req.cookies.refreshToken;

    if (!refreshTokenRequest) return res.status(401).json("You're not authenticated");

    const match = await RefreshToken.findOne({ refreshToken: refreshTokenRequest });

    if (!match) return res.status(401).json("You're not authenticated");

    jwt.verify(refreshTokenRequest, process.env.JWT_ACCESS_KEY, async (err, user) => {
      if (err) {
        await RefreshToken.deleteOne({ refreshToken: refreshTokenRequest });
        return res.status(403).json('Refresh token is not valid');
      }

      const newAccessToken = AuthenController.genarateAccessToken(user);
      console.log('user: ', user);
      const newRefreshToken = AuthenController.genarateRefreshToken(user);

      await RefreshToken.updateOne(
        { refreshToken: refreshTokenRequest },
        {
          refreshToken: newRefreshToken,
        },
      );

      AuthenController.setCookie(res, newRefreshToken);

      res.status(200).json({ accessToken: newAccessToken });
    });
  },

  logout: async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        return req.logOut(async () => {
          const refreshTokenRequest = req.cookies.refreshToken;
          if (!refreshTokenRequest) return res.status(401).json("You're not authenticated");
          await RefreshToken.deleteOne({ refreshToken: refreshTokenRequest });

          AuthenController.setCookie(res, '');

          res.status(200).json('Logout Successfully');
        });
      }

      const refreshTokenRequest = req.cookies.refreshToken;
      if (!refreshTokenRequest) return res.status(401).json("You're not authenticated");
      await RefreshToken.deleteOne({ refreshToken: refreshTokenRequest });

      AuthenController.setCookie(res, '');

      res.status(200).json('Logout Successfully');
    } catch (err) {
      res.status(500).json('Logout Failed');
    }
  },
};

module.exports = AuthenController;
