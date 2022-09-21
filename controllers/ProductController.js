const mongoose = require('mongoose');
const Product = require('../models/Product');

const ProductController = {
  getProduct: async (req, res) => {
    try {
      const product = await Product.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryTitle',
          },
        },
        {
          $unwind: {
            path: '$categoryTitle',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            categoryTitle: '$categoryTitle.title',
          },
        },
      ]);
      res.status(200).json(product[0]);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getProducts: async (req, res) => {
    try {
      const aggregatePipeline = [];

      const match = {
        title: {
          $regex: req.query.title,
          $options: 'gi',
        },
      };

      if (req.query.saleGte) {
        match.sale = {};
        match.sale.$gte = Number.parseFloat(req.query.saleGte);
      }

      if (req.query.saleLte) {
        match.sale.$lte = Number.parseFloat(req.query.saleLte);
      }

      console.log(match);

      if (req.query.listCategoryId) {
        match.$or = req.query.listCategoryId.split(',').map((e) => {
          return {
            categoryId: mongoose.Types.ObjectId(e),
          };
        });
      }

      aggregatePipeline.push({ $match: match });

      if (req.query.sort && req.query.order) {
        const sortReq = req.query.sort.split(',');
        const orderReq = req.query.order.split(',');
        const sort = sortReq.reduce((prev, curr, index) => {
          return {
            ...prev,
            [curr]: orderReq[index] === 'asc' ? 1 : -1,
          };
        }, {});
        aggregatePipeline.push({ $sort: sort });
      }

      aggregatePipeline.push({
        $facet: {
          pagination: [
            { $count: 'total' },
            {
              $addFields: {
                page: Number.parseInt(req.query.page),
              },
            },
          ],
          payload: [
            {
              $skip: req.query.limit * (req.query.page - 1),
            },
            {
              $limit: Number.parseInt(req.query.limit),
            },
          ], // add projection here wish you re-shape the docs
        },
      });

      const result = await Product.aggregate(aggregatePipeline);

      const formatResult = {
        pagination: {
          ...result[0].pagination[0],
          totalPage: Math.ceil(result[0].pagination[0]?.total / req.query.limit),
        },
        payload: result[0].payload,
      };

      res.status(200).json(formatResult);
    } catch (err) {
      res.status(500).json(err);
      console.log('err: ', err);
    }
  },

  addProduct: async (req, res) => {
    try {
      // const newProduct = await new Product({
      //   _id: mongoose.Types.ObjectId(req.body._id),
      //   title: req.body.title,
      //   firtWord: req.body.title[0],
      //   price: req.body.price,
      //   sale: req.body.sale,
      //   description: req.body.description,
      //   categoryId: mongoose.Types.ObjectId(req.body.categoryId),
      // });
      // const product = await newProduct.save();
      // res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = ProductController;
