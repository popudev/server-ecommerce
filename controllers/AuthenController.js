const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const UserGoogle = require('../models/UserGoogle');

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
        _id: user._id, // id is String
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
        _id: user._id,
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
      userId: user._id,
      refreshToken: refreshToken,
    });

    await newToken.save();
    AuthenController.setCookie(res, refreshToken);

    return accessToken;
  },

  loginGoogle: async (req, res) => {
    try {
      let userGoogle = await UserGoogle.findOne({ googleId: req.body.googleId });

      if (!userGoogle) {
        const newUserGoogle = new UserGoogle({
          fullname: req.body.fullname,
          avatar: req.body.avatar,
          googleId: req.body.googleId,
          email: req.body.email,
        });

        userGoogle = await newUserGoogle.save();
      }

      const accessToken = await AuthenController.loginSuccess(res, userGoogle);

      res.status(200).json({
        ...userGoogle._doc,
        accessToken,
      });
    } catch (err) {
      res.status(500).json(err.toString());
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
      const refreshTokenRequest = req.cookies.refreshToken;
      if (!refreshTokenRequest) return res.status(401).json("You're not authenticated");
      await RefreshToken.deleteOne({ refreshToken: refreshTokenRequest });

      AuthenController.setCookie(res, '');
      res.clearCookie('refreshToken');

      res.status(200).json('Logout Successfully');
    } catch (err) {
      res.status(500).json('Logout Failed');
    }
  },

  githubCallback: (req, res) => {
    console.log(req.query);
    res.redirect('http://localhost:3000?code=' + req.query.code);
  },
};

module.exports = AuthenController;
