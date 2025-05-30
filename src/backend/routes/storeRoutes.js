const express = require('express');
const router = express.Router();
const productController = require('../controllers/storeController');

router.get('/:storeNumber/productSearch/:productName', productController.getProductByStoreByName);

router.get('/:storeNumber/products', productController.getProductsByStore);

router.post('/:storeNumber/registerSale', productController.postNewSale);

router.get('/:storeNumber/sales', productController.getSalesByStore);

router.delete('/:storeNumber/returnSale/:saleId', productController.deleteSaleByStore);

module.exports = router;
