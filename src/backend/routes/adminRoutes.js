const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stores', adminController.getStores);

router.put('/product/update/:productName', adminController.updateProductInfo);

module.exports = router;