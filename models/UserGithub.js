const mongoose = require('mongoose');

const userGithubSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      required: true,
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
      default: 'github',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('UserGithub', userGithubSchema);
