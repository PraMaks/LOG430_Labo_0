const StoreInventory = require('../models/StoreInventory');
const Store = require('../models/Store');
const StoreSale = require('../models/StoreSale');
const SupplyRequest = require('../models/SupplyRequest');

exports.getProductsByStore = async (req, res) => {
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5) ou 'Central'" });
  }

  const storeName = `Magasin ${storeParam}`; 

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
        description: product.description,
        price: product.price,
        qty: product.qty,
        max_qty: product.max_qty
    }));
    res.json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getProductByStoreByName = async (req, res) => {
  const productName = req.params.productName;
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5) ou 'Central'" });
  }

  const storeName = `Magasin ${storeParam}`;

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
      description: product.description,
      price: product.price,
      qty: product.qty,
      max_qty: product.max_qty
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.postNewSale = async (req, res) => {
  const soldProducts = req.body;
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5) ou 'Central'" });
  }

  try { 
    // On cherche le magasin
    const storeName = `Magasin ${storeParam}`; 
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    // Gestion des produits
    let totalPrice = 0;
    for (const item of soldProducts) {
      const product = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (!product) {
        return res.status(404).json({ error: `Produit '${item.name}' introuvable dans le magasin ${storeParam}` });
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
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5) ou 'Central'" });
  }

  const storeName = `Magasin ${storeParam}`; 

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
  const saleId = req.params.saleId;
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5) ou 'Central'" });
  }

  const storeName = `Magasin ${storeParam}`; 

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    const sale = await StoreSale.findOne({ _id: saleId, store: store._id });
    if (!sale) {
      return res.status(404).json({ error: "Vente introuvable pour ce magasin." });
    }

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

exports.getProductsFromMainStore = async (req, res) => {
  const storeName = `Stock Central`; 

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
        description: product.description,
        price: product.price,
        qty: product.qty,
        max_qty: product.max_qty
    }));
    res.json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.postNewSupplyRequestFromStore = async (req, res) => {
  const requestedSupplies = req.body;
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    return res.status(400).json({ error: "Numéro de magasin invalide (1-5) ou 'Central'" });
  }

  try {
    // On cherche le magasin
    const storeName = `Magasin ${storeParam}`; 
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      return res.status(404).json({ error: `Magasin '${storeName}' introuvable` });
    }

    // Gestion des produits
    for (const item of requestedSupplies) {
      const product = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (!product) {
        return res.status(404).json({ error: `Produit '${item.name}' introuvable dans le magasin ${storeParam}` });
      }
    }

    // Gestion de la requete
    const supplyRequest = new SupplyRequest({
      store: store._id,
      products: requestedSupplies
    });
    await supplyRequest.save();
    await Store.updateOne(
      { _id: store._id },
      { $inc: { nb_requests: 1 } }
    );
    res.status(201).json({ message: "Requete enregistrée avec succès." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'enregistrement de la requete." });
  }
};
