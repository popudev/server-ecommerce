const Product = require('../models/Product');

const ProductController = {
  getProducts: async (req, res) => {
    try {
      console.log(req.query);
      const products = await Product.find();

      res.status(200).json({ payload: products });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  addProduct: async (req, res) => {
    try {
      const newProduct = await new Product({
        title: req.body.title,
        firtWord: req.body.title[0],
        price: req.body.price,
        sale: req.body.sale,
      });

      const product = await newProduct.save();
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = ProductController;
