const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    products: {
      type: Array,
    },
    userId: {
      type: mongoose.ObjectId,
      unique: true,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);