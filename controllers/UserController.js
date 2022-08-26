const Cart = require('../models/Cart');
const User = require('../models/User');

const UserController = {

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

  addProductCart: async (req, res) => {
    try {
      console.log(req.user);
      const cart = await Cart.findOne({userId: req.user.id})
      console.log(cart);
      res.status(200).json('Add to cart successfully');

    } catch(err) {

    }
  }
};

module.exports = UserController;
