const Cart = require('../models/Cart');

const CartController = {
  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id });
      res.status(200).json(cart.products);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  addProduct: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id });
      const product = req.body;

      const existsProduct = cart.products.filter((e) => e.productId === product.productId);

      if (existsProduct.length) {
        cart.products.map((e) => {
          if (e.productId === product.productId) {
            e.quantity += product.quantity;
          }
          return e;
        });
      } else {
        cart.products.push(product);
      }

      await Cart.updateOne(
        { userId: req.user.id },
        {
          $set: {
            products: cart.products,
          },
        },
      );

      res.status(200).json('Add to cart successfully');
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id });
      const productId = req.params.id;

      const newProductsInCart = cart.products.filter((e) => e.productId != productId);

      await Cart.updateOne(
        { userId: req.user.id },
        {
          $set: {
            products: newProductsInCart,
          },
        },
      );

      res.status(200).json('Delete to cart successfully');
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = CartController;
