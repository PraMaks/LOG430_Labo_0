const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');
const Cart = require('../models/Cart');
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

exports.updateProductsAfterSale = async (req, res) => {
  const storeParam = req.params.storeNumber;
  const isSale = req.params.isSale;
  const products = req.body;

  logger.info(products);

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
        path: `/api/v1/stocks/stores/${storeParam}//${isSale}`
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
          path: `/api/v1/stocks/stores/${storeParam}/${isSale}`
        }
      );
    }

    for (const item of products) {
      const product = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (!product) {
        logger.warn(`Produit '${item.name}' introuvable dans le magasin '${storeName}'`);
        return res.status(404).json(
          {
            timestamp: new Date().toISOString(),
            status: 404,
            error: "Not Found",
            message: `Produit '${item.name}' introuvable dans le magasin '${storeParam}'`,
            path: `/api/v1/stocks/stores/${storeParam}/${isSale}`
          }
        );
      }

      if (product.qty < item.qty && isSale === "true") {
        logger.warn(`Stock insuffisant pour '${item.name}'. Disponible : ${product.qty}`);
        return res.status(400).json(
          {
            timestamp: new Date().toISOString(),
            status: 400,
            error: "Bad Request",
            message: `Stock insuffisant pour '${item.name}'. Disponible : ${product.qty}`,
            path: `/api/v1/stocks/stores/${storeParam}/${isSale}`
          }
        );
      }

      if (isSale === "true") {
        product.qty -= item.qty;
      } else if (isSale === "false") {
        product.qty += item.qty;
      }
      
      await product.save();
    }
    res.status(200).json(products);
  } catch (err) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/stores/${storeParam}/${isSale}`
      }
    );
  }
};


exports.updateSupplyNbRequest = async (req, res) => {
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
        path: `/api/v1/stocks/stores/${storeParam}/supply`
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
          path: `/api/v1/stocks/stores/${storeParam}/supply`
        }
      );
    }

    await Store.updateOne(
          { _id: store._id },
          { $inc: { nb_requests: 1 } }
        );

    res.status(200).json(store);
  } catch (err) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/stores/${storeParam}/${isSale}`
      }
    );
  }
};


exports.updateUserCart = async (req, res) => {
  const user = req.params.user;
  const { contents } = req.body;

  if (!user || !Array.isArray(contents) || contents.length === 0) {
    console.error("Utilisateur ou contenu du panier manquant ou invalide");
    return res.status(400).json({ error: 'Utilisateur ou contenu du panier manquant ou invalide' });
  }

  try {
    // 🔍 Trouver le magasin "Stock Central"
    const centralStore = await Store.findOne({ name: "Stock Central" });
    if (!centralStore) {
      console.error(`Magasin "Stock Central" introuvable`);
      return res.status(500).json({ error: 'Le magasin central est introuvable' });
    }

    const centralStoreId = centralStore._id;

    // 🔁 Vérifie et décrémente l’inventaire
    for (const item of contents) {
      const inventoryItem = await StoreInventory.findOne({
        store: centralStoreId,
        name: item.name
      });

      if (!inventoryItem) {
        console.warn(`Produit "${item.name}" non trouvé dans le stock central`);
        continue;
      }

      if (inventoryItem.qty < item.qty) {
        return res.status(400).json({
          error: `Stock insuffisant dans "Stock Central" pour le produit "${item.name}"`
        });
      }

      inventoryItem.qty -= item.qty;
      await inventoryItem.save();
    }

    // 🔄 Cherche le panier existant
    let existingCart = await Cart.findOne({ user });

    if (!existingCart) {
      // 🆕 Création d’un nouveau panier
      const total_price = contents.reduce((acc, item) => acc + item.qty * item.price, 0);
      const newCart = new Cart({
        user,
        total_price: parseFloat(total_price.toFixed(2)),
        contents
      });
      await newCart.save();
    } else {
      // ♻️ Mise à jour du panier existant
      const updatedContents = [...existingCart.contents];

      for (const newItem of contents) {
        const existingIndex = updatedContents.findIndex(p => p.name === newItem.name);

        if (existingIndex !== -1) {
          // Produit déjà dans le panier ➝ on cumule
          updatedContents[existingIndex].qty += newItem.qty;
          updatedContents[existingIndex].total_price = parseFloat(
            (updatedContents[existingIndex].qty * updatedContents[existingIndex].price).toFixed(2)
          );
        } else {
          // Nouveau produit ➝ on l’ajoute
          updatedContents.push(newItem);
        }
      }

      // 🧮 Total global du panier
      const newTotal = updatedContents.reduce((acc, item) => acc + item.total_price, 0);

      existingCart.contents = updatedContents;
      existingCart.total_price = parseFloat(newTotal.toFixed(2));
      await existingCart.save();
    }

    return res.status(200).json({ message: 'Panier mis à jour avec fusion des produits et stock décrémenté' });

  } catch (error) {
    console.error(`[updateUserCart] Erreur serveur:`, error);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du panier' });
  }
};


