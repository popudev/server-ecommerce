const mongoose = require('mongoose');

const userFacebookSchema = new mongoose.Schema(
  {
    facebookId: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    admin: {
      type: Boolean,
      default: false,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: 'facebook',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('UserFacebook', userFacebookSchema);
