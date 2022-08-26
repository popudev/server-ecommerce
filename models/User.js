const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      min: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    verify: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
