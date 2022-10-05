const express = require('express');
const router = express.Router();

//Controllers
const AddressController = require('../controllers/AddressController');

//Middlewares
const AuthenMiddleware = require('../middlewares/AuthenMiddleware');

//Routes
router.get('/', AuthenMiddleware.verifyToken, AddressController.getAddress);
router.post('/', AuthenMiddleware.verifyToken, AddressController.addAddress);
router.patch('/', AuthenMiddleware.verifyToken, AddressController.updateAddress);
router.patch('/default', AuthenMiddleware.verifyToken, AddressController.updateAddressDefault);
router.delete('/:id', AuthenMiddleware.verifyToken, AddressController.deleteAddress);
// router.patch('/', AuthenMiddleware.verifyToken, AddressController.updateUser);

module.exports = router;
