const { default: mongoose } = require('mongoose');
const Category = require('../models/Category');

const CategoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();

      res.status(200).json(categories);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  addCategory: async (req, res) => {
    try {
      const newCategory = await Category({
        _id: mongoose.Types.ObjectId(req.body._id),
        title: req.body.title,
      });
      await newCategory.save();
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // addProduct: async (req, res) => {
  //   try {
  //     const newProduct = await new Product({
  //       title: req.body.title,
  //       firtWord: req.body.title[0],
  //       price: req.body.price,
  //       sale: req.body.sale,
  //     });

  //     const product = await newProduct.save();
  //     res.status(200).json(product);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },
};

module.exports = CategoryController;
