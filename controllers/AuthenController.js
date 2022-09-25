const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const passport = require('passport');

const AuthenController = {
  setCookie: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //public change true
      path: '/',
      sameSite: 'none',
      maxAge: 60000 * 60 * 24 * 365,
    });
  },

  genarateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
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
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '30d' },
    );
  },

  register: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      const newUser = await new User({
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
        const accessToken = AuthenController.genarateAccessToken(user);
        const refreshToken = AuthenController.genarateRefreshToken(user);

        const userId = user._doc._id;

        const newToken = await RefreshToken({
          userId: userId,
          refreshToken: refreshToken,
        });

        await newToken.save();

        const { password, ...other } = user._doc;

        AuthenController.setCookie(res, refreshToken);

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

  loginGithub: async (req, res) => {
    // router.get('/github', passport.authenticate('github', { scope: ['profile'] }));
    // router.get(
    //   '/github/callback',
    //   passport.authenticate('github', {
    //     successRedirect: CLIENT_URL,
    //     failureRedirect: '/login/failed',
    //   }),
    // );
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
