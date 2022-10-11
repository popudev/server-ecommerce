const { default: mongoose } = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const OrderController = {
  addOrder: async (req, res) => {
    try {
      if (!req.user.verify) return res.status(401).json('Account not verified');

      const newOrder = new Order({
        userId: req.user._id,
        address: req.body.address,
        products: req.body.products,
        totalPrice: req.body.totalPrice,
        discount: req.body.discount,
        shipping: req.body.shipping,
        total: req.body.total,
        payment: req.body.payment,
      });

      const order = await newOrder.save();
      await Cart.deleteMany({ userId: req.user._id });

      res.status(200).json(order);
    } catch (err) {
      console.log(err);
    }
  },

  getOrder: async (req, res) => {
    try {
      const order = await Order.findOne({ _id: req.params.id });
      res.status(200).json(order._doc);
    } catch (err) {
      console.log(err);
    }
  },

  getOrderList: async (req, res) => {
    try {
      let status = {};
      if (Number.parseInt(req.query.status) !== 0) {
        status = {
          status: Number.parseInt(req.query.status),
        };
      }

      const result = await Order.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(req.user._id),
            ...status,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
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
        },
      ]);
      const formatResult = {
        pagination: {
          ...result[0].pagination[0],
          totalPage: Math.ceil(result[0].pagination[0]?.total / req.query.limit),
        },
        payload: result[0].payload,
      };

      res.status(200).json(formatResult);
    } catch (err) {
      console.log(err);
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      if (req.body.status !== 3 && !req.user.admin) return res.status(401).json();

      await Order.updateOne({ _id: req.body.id }, { status: req.body.status });

      res.status(200).json('Updated Succesfully');
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = OrderController;
