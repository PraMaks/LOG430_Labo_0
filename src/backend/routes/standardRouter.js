const express = require('express');
const router = express.Router();
const productController = require('../controllers/storeController');
const { authenticate } = require('../controllers/loginController');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Liste tous les produits
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/stores/:storeNumber/stock/:productName', authenticate, productController.getProductByStoreByName);

router.get('/stores/warehouse/stock', authenticate, productController.getProductsFromWarehouse);

router.get('/stores/:storeNumber/stock', authenticate, productController.getProductsByStore);

router.post('/stores/:storeNumber/sales', authenticate, productController.postNewSaleInStore);

router.get('/stores/:storeNumber/sales', authenticate, productController.getSalesByStore);

router.delete('/stores/:storeNumber/sales/:saleId', authenticate, productController.deleteSaleByStore);

router.post('/stores/:storeNumber/supplies', authenticate, productController.postNewSupplyRequestFromStore)

module.exports = router;
