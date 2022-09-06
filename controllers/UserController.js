const User = require('../models/User');

const UserController = {
  getUser: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user.id });
      console.log('user: ', user);
      const { password, ...other } = user._doc;
      res.status(200).json(other);
    } catch (err) {
      console.log('err: ', err);
      res.status(500).json(err);
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
