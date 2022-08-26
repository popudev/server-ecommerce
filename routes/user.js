const express = require('express');
const router = express.Router();

//Controllers
const UserController = require('../controllers/UserController');

//Middlewares
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, UserController.getAllUsers);
router.delete('/:id', AuthenMiddleware.verifyToken, AuthenMiddleware.isAdmin, UserController.deleteUser);

module.exports = router;
