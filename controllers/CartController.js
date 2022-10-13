const Cart = require('../models/Cart');
const mongoose = require('mongoose');

const CartController = {
  getCart: async (req, res) => {
    try {
      const cart = await Cart.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.user._id),
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
      const product = {
        ...req.body,
        productId: mongoose.Types.ObjectId(req.body.productId),
      };

      const cart = await Cart.find({ userId: req.user._id });

      const existsProduct = cart.filter(
        (e) => e.productId.toString() === product.productId.toString(),
      );

      if (existsProduct.length) {
        const itemCart = existsProduct[0];
        await Cart.updateOne(
          { _id: itemCart._id },
          {
            quantity: itemCart.quantity + product.quantity,
          },
        );
      } else {
        const newItemCart = new Cart({
          userId: req.user._id,
          ...product,
        });
        await newItemCart.save();
      }

      res.status(200).json('Add to cart successfully');
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateQuantityProduct: async (req, res) => {
    try {
      const quantity = req.body.quantity;
      const productId = req.body.productId;
      await Cart.updateOne({ userId: req.user._id, productId: productId }, { quantity: quantity });
      res.status(200).json('Updated Quantity Successfully');
    } catch (err) {
      res.status(500).json(err.toString());
    }
  },

  deleteProduct: async (req, res) => {
    try {
      await Cart.deleteOne({ _id: req.params.id, userId: req.user._id });
      res.status(200).json('Delete to cart successfully');
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = CartController;
