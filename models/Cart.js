const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    products: {
      type: Array,
    },
    userId: {
      type: mongoose.ObjectId,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);