const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../controllers/loginController');

router.get('/stores/all', authenticate, adminController.getStores);

router.put('/stores/all/stock/:productName', authenticate, adminController.updateProductInfo);

module.exports = router;