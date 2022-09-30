const User = require('../models/User');
const UserFacebook = require('../models/UserFacebook');
const UserGithub = require('../models/UserGithub');
const UserGoogle = require('../models/UserGoogle');

const UserController = {
  getUser: async (req, res) => {
    try {
      let user = {};

      switch (req.user.provider) {
        case 'github':
          user = await UserGithub.findOne({ _id: req.user._id });
          break;
        case 'google':
          user = await UserGoogle.findOne({ _id: req.user._id });
          break;
        case 'facebook':
          user = await UserFacebook.findOne({ _id: req.user._id });
          break;
        default:
          user = await User.findOne({ _id: req.user._id });
      }

      const { password, ...other } = user._doc;
      res.status(200).json(other);
    } catch (err) {
      res.status(500).json(err);
      console.log('err: ', err);
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();

      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const result = await User.find({ _id: req.params.id });

      if (result) {
        res.status(200).json('Delete successfully');
      } else {
        res.status(404).json({
          mess: 'Not Found User !!!',
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = UserController;
