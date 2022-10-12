const express = require('express');
const router = express.Router();

//Controller
const CartController = require('../controllers/CartController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');
const RateLimitMiddleware = require('../middlewares/RateLimitMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, CartController.getCart);
router.post(
  '/',
  RateLimitMiddleware.apiLimiter,
  AuthenMiddleware.verifyToken,
  CartController.addProduct,
);
router.delete(
  '/product/:id',
  RateLimitMiddleware.apiLimiter,
  AuthenMiddleware.verifyToken,
  CartController.deleteProduct,
);

module.exports = router;
