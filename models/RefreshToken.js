const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    agent: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
