const express = require('express');
const router = express.Router();
const productController = require('../controllers/storeController');
const StoreSale = require('../models/StoreSale');

router.get('/:storeNumber/productSearch/:productName', productController.getProductByStoreByName);

router.get('/:storeNumber/products', productController.getProductsByStore);

router.post('/:storeNumber/registerSale', productController.postNewSale);

router.get('/sales', async (req, res) => {
    try {
        const ventes = await StoreSale.find();
        res.json(ventes);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
    }
});

module.exports = router;
