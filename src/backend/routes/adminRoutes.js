const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../controllers/loginController');

router.get('/stores', authenticate, adminController.getStores);

router.put('/product/update/:productName', authenticate, adminController.updateProductInfo);

module.exports = router;