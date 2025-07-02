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

  const isNumber = !isNaN(parseInt(storeParam)) && parseInt(storeParam) >= 1 && parseInt(storeParam) <= 5;
  const isCentral = storeParam === 'Central';
  const isStock = storeParam === 'StockCentral';

  if (!isNumber && !isCentral && !isStock) {
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

  let storeName;

  if (!isStock) {
    storeName = `Magasin ${storeParam}`; 
  } else {
    storeName = 'Stock Central'
  } 

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
  const { contents, replace } = req.body;

  if (!user || !Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Utilisateur ou contenu du panier manquant ou invalide",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }

  try {
    const centralStore = await Store.findOne({ name: "Stock Central" });
    if (!centralStore) {
      return res.status(404).json(
      {
        timestamp: new Date().toISOString(),
        status: 404,
        error: "Not Found",
        message: "Le magasin en ligne est introuvable",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
    }

    const centralStoreId = centralStore._id;

    for (const item of contents) {
      const inventoryItem = await StoreInventory.findOne({ store: centralStoreId, name: item.name });
      if (!inventoryItem) continue;

      if (inventoryItem.qty < item.qty) {
        return res.status(400).json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: "Bad Request",
          message: `Stock insuffisant pour le produit "${item.name}"`,
          path: `/api/v1/stocks/${user}/cart`
        }
    );
      }

      inventoryItem.qty -= item.qty;
      await inventoryItem.save();
    }

    const total_price = contents.reduce((total, item) => {
      return total + (item.price * item.qty);
    }, 0);

    if (replace) {
      await Cart.findOneAndUpdate(
        { user },
        {
          user,
          total_price: parseFloat(total_price.toFixed(2)),
          contents
        },
        { upsert: true, new: true, runValidators: true }
      );
    } else {
      const existingCart = await Cart.findOne({ user }) || { contents: [] };
      const updatedContents = [...existingCart.contents];

      for (const newItem of contents) {
        const index = updatedContents.findIndex(p => p.name === newItem.name);
        if (index !== -1) {
          updatedContents[index].qty += newItem.qty;
          updatedContents[index].total_price = parseFloat(
            (updatedContents[index].qty * updatedContents[index].price).toFixed(2)
          );
        } else {
          updatedContents.push(newItem);
        }
      }

      const newTotal = updatedContents.reduce((acc, item) => acc + item.total_price, 0);
      await Cart.findOneAndUpdate(
        { user },
        {
          user,
          total_price: parseFloat(newTotal.toFixed(2)),
          contents: updatedContents
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    return res.status(200).json({ message: 'Panier mis à jour avec succès' });

  } catch (error) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }
};

exports.getUserCart = async (req, res) => {
  const user = req.params.user;
  try {
    const cart = await Cart.findOne({ user });
    if (!cart) {
      res.status(500).json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: "Bad Request",
          message: "Panier est vide/non-existant",
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }
    res.status(200).json(cart);
  } catch (error) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }
};


exports.updateUserCartItem = async (req, res) => {
  const user = req.params.user;
  const { name, qty } = req.body;

  if (!user || !name || typeof qty !== 'number') {
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Utilisateur ou contenu du panier manquant ou invalide",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }

  try {
    const cart = await Cart.findOne({ user });
    if (!cart) {
       return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Panier introuvable",
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }

    const itemIndex = cart.contents.findIndex(p => p.name === name);
    if (itemIndex === -1) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Produit non trouvé dans le panier",
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }

    const product = cart.contents[itemIndex];
    const previousQty = product.qty;
    const difference = qty - previousQty;

    // Trouver le produit dans le stock central
    const centralStore = await Store.findOne({ name: "Stock Central" });
    if (!centralStore) {
       return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Magasin d'achat en ligne introuvable",
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }

    const inventoryItem = await StoreInventory.findOne({
      store: centralStore._id,
      name: name
    });

    if (!inventoryItem) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Produit "${name}" introuvable dans le stock central`,
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }

    // Vérifie si le stock est suffisant
    if (difference > 0 && inventoryItem.qty < difference) {
      return res.status(400).json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: "Bad Request",
          message: `Stock insuffisant pour "${name}"`,
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }

    // Ajuster l'inventaire central
    inventoryItem.qty -= difference;
    await inventoryItem.save();

    // Mettre à jour le produit dans le panier
    product.qty = qty;
    product.total_price = parseFloat((qty * product.price).toFixed(2));
    cart.contents[itemIndex] = product;

    // Recalcul du total général du panier
    cart.total_price = cart.contents.reduce((acc, p) => acc + p.total_price, 0);
    await cart.save();

    return res.status(200).json({ message: "Article mis à jour avec succès" });
  } catch (err) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }
};

exports.deleteUserCartItem = async (req, res) => {
  const user = req.params.user;
  const { name, qty } = req.body;

  if (!user || !name || typeof qty !== 'number') {
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Champs invalides pour suppression",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }

  try {
    const cart = await Cart.findOne({ user });
    if (!cart) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Panier introuvable",
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    } 

    const itemIndex = cart.contents.findIndex(p => p.name === name);
    if (itemIndex === -1) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Produit non trouvé dans le panier",
          path: `/api/v1/stocks/${user}/cart`
        }
      );
    }

    const removedItem = cart.contents[itemIndex];
    const removedQty = removedItem.qty;

    // Supprimer du panier
    cart.contents.splice(itemIndex, 1);
    cart.total_price = cart.contents.reduce((acc, p) => acc + p.total_price, 0);
    await cart.save();

    // Recréditer l'inventaire
    const centralStore = await Store.findOne({ name: "Stock Central" });
    if (!centralStore) return res.status(500).json({ error: "Magasin central introuvable" });

    const inventoryItem = await StoreInventory.findOne({
      store: centralStore._id,
      name: name
    });

    if (inventoryItem) {
      inventoryItem.qty += removedQty;
      await inventoryItem.save();
    }

    return res.status(200).json({ message: "Produit supprimé et stock restauré." });

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/${user}/cart`
      }
    );
  }
};


exports.deleteUserCartItems = async (req, res) => {
  const user = req.params.user;

  if (!user) {
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Nom d'utilisateuur manquant",
        path: `/api/v1/stocks/${user}/cart/all`
      }
    );
  }

  try {
    const cart = await Cart.findOne({ user });
    if (!cart) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Panier introuvable",
          path: `/api/v1/stocks/${user}/cart/all`
        }
      );
    } 

    const centralStore = await Store.findOne({ name: "Stock Central" });
    if (!centralStore) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: "Magasin d'achat introuvable",
          path: `/api/v1/stocks/${user}/cart/all`
        }
      );
    } 

    // Supprimer tous les items du panier
    cart.contents = [];
    cart.total_price = 0;
    await cart.save();

    return res.status(200).json({ message: "Panier vidé" });

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/stocks/${user}/cart/all`
      }
    );
  }
};
