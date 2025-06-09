const express = require('express');
const router = express.Router();
const standardController = require('../controllers/standardController');
const { authenticate } = require('../controllers/authController');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Liste tous les produits
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/stores/:storeNumber/stock/:productName', authenticate, standardController.getProductByStoreByName);

router.get('/stores/warehouse/stock', authenticate, standardController.getProductsFromWarehouse);

router.get('/stores/:storeNumber/stock', authenticate, standardController.getProductsByStore);

router.post('/stores/:storeNumber/sales', authenticate, standardController.postNewSaleInStore);

router.get('/stores/:storeNumber/sales', authenticate, standardController.getSalesByStore);

router.delete('/stores/:storeNumber/sales/:saleId', authenticate, standardController.deleteSaleByStore);

router.post('/stores/:storeNumber/supplies', authenticate, standardController.postNewSupplyRequestFromStore)

module.exports = router;
