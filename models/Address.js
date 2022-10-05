const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
    },
    fullname: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    defaultAddress: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Address', addressSchema);
