const StoreInventory = require('../models/StoreInventory');

exports.getAllProducts = async (req, res) => {
    try {
        const produits = await StoreInventory.find(); 
        res.json(produits);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
};