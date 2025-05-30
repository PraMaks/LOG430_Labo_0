const StoreInventory = require('../models/StoreInventory');
const Store = require('../models/Store');

exports.getProductsByStore = async (req, res) => {
  const storeNumber = parseInt(req.params.storeNumber);

  if (isNaN(storeNumber) || storeNumber < 1 || storeNumber > 5) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5)" });
  }

  const storeName = `Magasin ${storeNumber}`; 

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    // On cherche les produits liés à ce magasin via son ObjectId
    const rawProducts = await StoreInventory.find({ store: store._id });

    // On filtre les données JSON
    const products = rawProducts.map(product => ({
        name: product.name,
        price: product.price,
        qty: product.qty
    }));
    res.json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getProductByStoreByName = async (req, res) => {
  const storeNumber = parseInt(req.params.storeNumber);
  const productName = req.params.productName;

  if (isNaN(storeNumber) || storeNumber < 1 || storeNumber > 5) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5)" });
  }

  const storeName = `Magasin ${storeNumber}`;

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    // Recherche du produit dans ce magasin
    const product = await StoreInventory.findOne({ store: store._id, name: productName });
    if (!product) {
      return res.status(404).json({ error: `Produit '${productName}' introuvable dans le magasin '${storeName}'` });
    }

    // Retour des infos filtrées du produit
    res.json({
      name: product.name,
      price: product.price,
      qty: product.qty
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
