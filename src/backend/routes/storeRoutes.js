const express = require('express');
const router = express.Router();
const productController = require('../controllers/storeController');
const { authenticate } = require('../controllers/loginController');

router.get('/:storeNumber/productSearch/:productName', authenticate, productController.getProductByStoreByName);

router.get('/mainStore/products', authenticate, productController.getProductsFromWarehouse);

router.get('/:storeNumber/products', authenticate, productController.getProductsByStore);

router.post('/:storeNumber/registerSale', authenticate, productController.postNewSale);

router.get('/:storeNumber/sales', authenticate, productController.getSalesByStore);

router.delete('/:storeNumber/returnSale/:saleId', authenticate, productController.deleteSaleByStore);

router.post('/:storeNumber/requestSupplies', authenticate, productController.postNewSupplyRequestFromStore)

module.exports = router;
