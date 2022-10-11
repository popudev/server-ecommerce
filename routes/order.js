const express = require('express');
const router = express.Router();

//Controller
const OrderController = require('../controllers/OrderController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, OrderController.getOrderList);
router.get('/:id', AuthenMiddleware.verifyToken, OrderController.getOrder);
router.post('/', AuthenMiddleware.verifyToken, OrderController.addOrder);
router.patch('/', AuthenMiddleware.verifyToken, OrderController.updateOrderStatus);

module.exports = router;
