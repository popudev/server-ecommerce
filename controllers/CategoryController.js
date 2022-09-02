const Category = require('../models/Category');

const CategoryController = {
  getCategories: async (req, res) => {
    try {
      console.log(req.query);
      const categories = await Category.find();
      res.status(200).json(categories);
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
