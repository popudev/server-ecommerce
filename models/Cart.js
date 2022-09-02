const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
    },
    productId: {
      type: mongoose.ObjectId,
    },
    quantity: {
      type: Number,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);
