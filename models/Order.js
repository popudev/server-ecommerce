const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
    },
    products: {
      type: Array,
    },
    totalPrice: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    address: {
      type: Object,
    },
    shipping: {
      type: Object,
    },
    total: {
      type: Number,
    },
    payment: {
      type: Object,
    },
    status: {
      type: Object,
      default: {
        code: 1,
        title: 'Pending',
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
