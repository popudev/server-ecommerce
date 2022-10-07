const express = require('express');
const router = express.Router();

//Controllers
const UserController = require('../controllers/UserController');

//Middlewares
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, UserController.getUser);
router.get('/find/account', UserController.getUserByEmailOrPhone);
router.patch('/', AuthenMiddleware.verifyToken, UserController.updateUser);
router.patch('/password', AuthenMiddleware.verifyToken, UserController.changePassword);

module.exports = router;
