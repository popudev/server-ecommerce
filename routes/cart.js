const express = require('express');
const router = express.Router();

//Controller
const UserController = require('../controllers/UserController');

//MiddleWare
const AuthenMiddleware = require('../middlewares/AuthenMiddleware')

//Routes
router.post('/', AuthenMiddleware.verifyToken, UserController.addProductCart);


module.exports = router;