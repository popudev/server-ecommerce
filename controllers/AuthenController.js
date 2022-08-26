const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const User = require('../models/User');

const refreshTokens = [];

const AuthenController = {
  genarateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '60s' },
    );
  },

  genarateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: '365d' },
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
      const { _id, username } = user._doc;

      const newCart = await new Cart({
        userId: _id,
      })
      await newCart.save();

      res.status(200).json(username);

    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  login: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });

      if (!user) return res.status(404).json({
        key: 'username',
        mess: 'Username is not exist'
      });

      const match = await bcrypt.compare(req.body.password, user.password);

      if (match) {
        const accessToken = AuthenController.genarateAccessToken(user);
        const refreshToken = AuthenController.genarateRefreshToken(user);

        refreshTokens.push(refreshToken);

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,//public change true
          path: '/',
          sameSite: 'strict',
          expires: new Date(Date.now() + 900000),
        });

        const { password, admin, ...others } = user._doc;

        res.status(200).json({
          ...others,
          accessToken,
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

  requestRefreshToken: async (req, res) => {
    if (!req.cookies.refreshToken) return res.status(401).json("You're not authenticated");

    jwt.verify(req.cookies.refreshToken, process.env.JWT_ACCESS_KEY, (err, user) => {
      if (err) {
        return res.status(403).json('Token is not valid');
      }

      const newAccessToken = AuthenController.genarateAccessToken(user);
      const newRefreshToken = AuthenController.genarateRefreshToken(user);

      refreshTokens.filter((token) => token !== req.cookies.refreshToken);
      refreshTokens.push(newRefreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'strict',
      });

      res.status(200).json({ accessToken: newAccessToken });
    });
  },

  logout: (req, res) => {
    if (!req.cookies.refreshToken) return res.status(401).json("You're not authenticated");
    refreshTokens.filter((token) => token !== req.cookies.refreshToken);
    res.cookie('refreshToken', '');
    res.status(200).json('Logout Successfully');
  },
};

module.exports = AuthenController;
