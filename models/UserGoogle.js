const mongoose = require('mongoose');

const userGoogleSchema = new mongoose.Schema(
  {
    googleId: {
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
      default: 'google',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('UserGoogle', userGoogleSchema);
