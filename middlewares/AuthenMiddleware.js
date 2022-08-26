const jwt = require('jsonwebtoken');

const AuthenMiddleware = {
  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      const accessToken = token.split(' ')[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          return res.status(403).json('Token is not valid');
        }

        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You're not authenticated");
    }
  },

  isAdmin: (req, res, next) => {
    if (req.params.id === req.user.id || req.user.admin) {
      next();
    } else {
      res.status(403).json("You're not allowed");
    }
  },
};

module.exports = AuthenMiddleware;
