const express = require('express');
const router = express.Router();

//Controllers
const UserController = require('../controllers/UserController');

//Middlewares
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, UserController.getUser);
router.patch('/', AuthenMiddleware.verifyToken, UserController.updateUser);

module.exports = router;
