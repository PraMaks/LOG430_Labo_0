const StoreInventory = require('../models/StoreInventory');
const Store = require('../models/Store');
const StoreSale = require('../models/StoreSale');
const SupplyRequest = require('../models/SupplyRequest');
const logger = require('../utils/logger');

exports.postNewSaleInStore = async (req, res) => {
  const soldProducts = req.body;
  const storeParam = req.params.storeNumber;

  logger.info("BODY")
  logger.info(soldProducts);

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
        path: `/api/v1/standard/stores/${storeParam}/sales`
      }
    );
  }

  try { 
    // On cherche le magasin
    const storeName = `Magasin ${storeParam}`; 
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      logger.warn(`Magasin '${storeName}' introuvable`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Magasin '${storeName}' introuvable`,
          path: `/api/v1/standard/stores/${storeParam}/sales`
        }
      );
    }

    // Gestion des produits
    let totalPrice = 0;
    for (const item of soldProducts) {
      const product = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (!product) {
        logger.warn(`Produit '${productName}' introuvable dans le magasin '${storeName}'`);
        return res.status(404).json(
          {
            timestamp: new Date().toISOString(),
            status: 404,
            error: "Not Found",
            message: `Produit '${item.name}' introuvable dans le magasin '${storeParam}'`,
            path: `/api/v1/standard/stores/${storeParam}/stock/${item.name}`
          }
        );
      }

      if (product.qty < item.qty) {
        logger.warn(`Stock insuffisant pour '${item.name}'. Disponible : ${product.qty}`);
        return res.status(400).json(
          {
            timestamp: new Date().toISOString(),
            status: 400,
            error: "Bad Request",
            message: `Stock insuffisant pour '${item.name}'. Disponible : ${product.qty}`,
            path: `/api/v1/standard/stores/${storeParam}/stock/${item.name}`
          }
        );
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
    logger.info(`Vente enregistrée avec succès.`);
    res.status(201).json({ message: "Vente enregistrée avec succès." });

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/standard/stores/${storeParam}/stock/${item.name}`
      }
    );
  }
};

exports.getSalesByStore = async (req, res) => {
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
        path: `/api/v1/standard/stores/${storeParam}/sales`
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
          path: `/api/v1/standard/stores/${storeParam}/sales`
        }
      );
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
    logger.info(`Ventes trouvées`);
    res.status(200).json(sales);

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/standard/stores/${storeParam}/sales`
      }
    );
  }
};

exports.deleteSaleByStore = async (req, res) => {
  const saleId = req.params.saleId;
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
        path: `/api/v1/standard/stores/${storeParam}/sales/${saleId}`
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
          path: `/api/v1/standard/stores/${storeParam}/sales/${saleId}`
        }
      );
    }

    const sale = await StoreSale.findOne({ _id: saleId, store: store._id });
    if (!sale) {
      logger.warn(`Vente introuvable dans ce magasin.`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Vente introuvable dans ce magasin.`,
          path: `/api/v1/standard/stores/${storeParam}/sales/${saleId}`
        }
      );
    }

    // Remettre les produits vendus en stock
    for (const item of sale.contents) {
      const inventoryItem = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (inventoryItem) {
        inventoryItem.qty += item.qty;
        await inventoryItem.save();
      } else {
        logger.warn(`Produit '${item.name}' non trouvé dans l'inventaire. Impossible de remettre en stock.`);
      }
    }

    await StoreSale.deleteOne({ _id: saleId });
    logger.info(`Vente supprimée et stock mis à jour.`);
    res.status(200).json({ message: "Vente supprimée et stock mis à jour." });
  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/standard/stores/${storeParam}/sales/${saleId}`
      }
    );
  }
};
