const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stores', adminController.getStores);

module.exports = router;