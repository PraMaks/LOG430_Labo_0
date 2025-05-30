const StoreInventory = require('../models/StoreInventory');
const Store = require('../models/Store');
const StoreSale = require('../models/StoreSale');

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

exports.postNewSale = async (req, res) => {
  const storeNumber = req.params.storeNumber;
  const soldProducts = req.body;

  if (!Array.isArray(soldProducts) || soldProducts.length === 0) {
    return res.status(400).json({ error: 'Données de vente invalides ou vides.' });
  }

  try {
    if (isNaN(storeNumber) || storeNumber < 1 || storeNumber > 5) {
        return res.status(400).json({ error: "Numéro de magasin invalide (1-5)" });
    }

    // On cherche le magasin
    const storeName = `Magasin ${storeNumber}`; 
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    // Gestion des produits
    let totalPrice = 0;
    for (const item of soldProducts) {
      const product = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (!product) {
        return res.status(404).json({ error: `Produit '${item.name}' introuvable dans le magasin ${storeNumber}` });
      }

      if (product.qty < item.qty) {
        return res.status(400).json({ error: `Stock insuffisant pour '${item.name}'. Disponible : ${product.qty}` });
      }

      product.qty -= item.qty;
      await product.save();
      totalPrice += item.total_price;
    }

    // Gestion de la vente
    const sale = new StoreSale({
      store: store._id,
      total_price: totalPrice,
      contents: soldProducts
    });
    await sale.save();
    res.status(201).json({ message: "Vente enregistrée avec succès." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'enregistrement de la vente." });
  }
};

exports.getSalesByStore = async (req, res) => {
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
    const rawSales = await StoreSale.find({ store: store._id });

    // On filtre les données JSON
    const sales = rawSales.map(sale => ({
        _id: sale._id,
        name: sale.name,
        total_price: sale.total_price,
        contents: sale.contents,
        date: sale.date,
    }));
    res.json(sales);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.deleteSaleByStore = async (req, res) => {
  const storeNumber = parseInt(req.params.storeNumber);
  const saleId = req.params.saleId;

  if (isNaN(storeNumber) || storeNumber < 1 || storeNumber > 5) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5)" });
  }

  const storeName = `Magasin ${storeNumber}`; 

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    const sale = await StoreSale.findOne({ _id: saleId, store: store._id });
    if (!sale) {
      return res.status(404).json({ error: "Vente introuvable pour ce magasin." });
    }

    console.log(sale);

    // Remettre les produits vendus en stock
    for (const item of sale.contents) {
      const inventoryItem = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (inventoryItem) {
        inventoryItem.qty += item.qty;
        await inventoryItem.save();
      } else {
        console.warn(`Produit '${item.name}' non trouvé dans l'inventaire. Impossible de remettre en stock.`);
      }
    }

    await StoreSale.deleteOne({ _id: saleId });

    res.status(200).json({ message: "Vente supprimée et stock mis à jour." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
