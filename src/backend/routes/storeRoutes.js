const express = require('express');
const router = express.Router();
const productController = require('../controllers/storeController');
const StoreSale = require('../models/StoreSale');

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/about', (req, res) => {
    res.send('Welcome to about us page');
});

router.get('/contact', (req, res) => {
    res.send('Welcome to contact us page');
});

router.get('/:storeNumber/products', productController.getProductsByStore);

router.get('/sales', async (req, res) => {
    try {
        const ventes = await StoreSale.find();
        res.json(ventes);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
    }
});

module.exports = router;
