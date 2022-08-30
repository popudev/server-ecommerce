const express = require('express');
const router = express.Router();

//Controller
const CartController = require('../controllers/CartController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, CartController.getCart);
router.post('/', AuthenMiddleware.verifyToken, CartController.addProduct);
router.delete('/product/:id', AuthenMiddleware.verifyToken, CartController.deleteProduct);

module.exports = router;
