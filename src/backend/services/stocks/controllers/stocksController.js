const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');
const logger = require('../utils/logger');

exports.getStores = async (req, res) => { 
  try {
    const rawStores = await Store.find();

    // On filtre les données JSON
    const stores = rawStores.map(store => ({
        name: store.name,
        address: store.address,
        nb_requests: store.nb_requests,
        is_store: store.is_store,
    }));
    logger.info(`Magasins envoyés`);
    res.json(stores);

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/storesAll`
      }
    );
  }
};

exports.updateProductInfo = async (req, res) => {
  const productName = req.params.productName;
  const { name, description, price } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;

  try {
    const result = await StoreInventory.updateMany(
      { name: productName },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      logger.warn(`Aucun produit trouvé avec ce nom`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Aucun produit trouvé avec ce nom`,
          path: `/api/v1/stocks/storesAll/${productName}`
        }
      );
    }

    logger.info(`Produit '${productName}' mis à jour dans ${result.modifiedCount} magasin(s)`);
    res.status(200).json({
      message: `Produit '${productName}' mis à jour dans ${result.modifiedCount} magasin(s)`,
      result,
    });
  } catch (error) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/storesAll/${productName}`
      }
    );
  }
};

exports.getProductByStoreByName = async (req, res) => {
  const productName = req.params.productName;
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    logger.warn(`Numéro de magasin invalide (1-5) ou 'Central'`);
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Numéro de magasin invalide (1-5) ou 'Central'",
        path: `/api/v1/stocks/stores/${storeParam}/${productName}`
      }
    );
  }

  const storeName = `Magasin ${storeParam}`;

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      logger.warn(`Magasin '${storeName}' introuvable`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Magasin '${storeName}' introuvable`,
          path: `/api/v1/stocks/stores/${storeParam}/${productName}`
        }
      );
    }

    // Recherche du produit dans ce magasin
    const product = await StoreInventory.findOne({ store: store._id, name: productName });
    if (!product) {
      logger.warn(`Produit '${productName}' introuvable dans le magasin '${storeName}'`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Produit '${productName}' introuvable dans le magasin '${storeName}'`,
          path: `/api/v1/stocks/stores/${storeParam}/${productName}`
        }
      );
    }

    // Retour des infos filtrées du produit
    logger.info(`Produit trouvé`);
    res.status(200).json({
      name: product.name,
      description: product.description,
      price: product.price,
      qty: product.qty,
      max_qty: product.max_qty
    });

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/stores/${storeParam}/${productName}`
      }
    );
  }
};

exports.getProductsFromWarehouse = async (req, res) => {
  const storeName = `Stock Central`; 

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      logger.warn(`Magasin '${storeName}' introuvable`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Magasin '${storeName}' introuvable`,
          path: `/api/v1/stocks/stores/warehouse`
        }
      );
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
    logger.info(`Produits recupérées dans le centre de stock`);
    res.status(200).json(products);

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/stores/warehouse`
      }
    );
  }
};

exports.getProductsByStore = async (req, res) => {
  const storeParam = req.params.storeNumber;

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';

  if (!isNumber && !isCentral) {
    logger.warn(`Numéro de magasin invalide (1-5) ou 'Central'`);
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Numéro de magasin invalide (1-5) ou 'Central'",
        path: `/api/v1/stocks/stores/${storeParam}`
      }
    );
  }

  const storeName = `Magasin ${storeParam}`; 

  try {
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      logger.warn(`Magasin '${storeName}' introuvable`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Magasin '${storeName}' introuvable`,
          path: `/api/v1/stocks/stores/${storeParam}`
        }
      );
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
    logger.info(`Produits trouvés`);
    res.status(200).json(products);

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/stores/${storeParam}`
      }
    );
  }
};


