const express = require('express');
const router = express.Router();

//Controller
const ProductController = require('../controllers/ProductController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', ProductController.getProducts);
router.get('/random', ProductController.getProductsRamdom);
router.get('/:id', ProductController.getProduct);

router.post('/', ProductController.addProduct);
// router.delete('/:id', AuthenMiddleware.verifyToken, ProductController.deleteProduct);

module.exports = router;
