const express = require('express');
const router = express.Router();

//Controller
const CategoryController = require('../controllers/CategoryController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', CategoryController.getCategories);

// router.delete('/:id', AuthenMiddleware.verifyToken, ProductController.deleteProduct);

module.exports = router;
