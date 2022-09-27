const Cart = require('../models/Cart');
const mongoose = require('mongoose');

const CartController = {
  getCart: async (req, res) => {
    try {
      const cart = await Cart.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.user.id),
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        {
          $unwind: {
            path: '$product',
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: {
            _id: 1,
            product: 1,
            quantity: 1,
          },
        },
      ]);

      res.status(200).json(cart);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  addProduct: async (req, res) => {
    try {
      console.log(req.user.id);

      const product = {
        ...req.body,
        productId: mongoose.Types.ObjectId(req.body.productId),
      };

      const cart = await Cart.find({ userId: req.user.id });

      const existsProduct = cart.filter((e) => e.productId.toString() === product.productId.toString());

      if (existsProduct.length) {
        const itemCart = existsProduct[0];
        await Cart.updateOne(
          { _id: itemCart.id },
          {
            quantity: itemCart.quantity + product.quantity,
          },
        );
      } else {
        const newItemCart = new Cart({
          userId: req.user.id,
          ...product,
        });
        await newItemCart.save();
      }

      res.status(200).json('Add to cart successfully');
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteProduct: async (req, res) => {
    try {
      await Cart.deleteOne({ _id: req.params.id, userId: req.user.id });
      res.status(200).json('Delete to cart successfully');
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = CartController;
