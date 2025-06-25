const StoreInventory = require('../models/StoreInventory');
const Store = require('../models/Store');
const SupplyRequest = require('../models/SupplyRequest');
const logger = require('../utils/logger');

exports.postNewSupplyRequestFromStore = async (req, res) => {
  const requestedSupplies = req.body;
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
        path: `/api/v1/standard/stores/${storeParam}/supplies`
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
          path: `/api/v1/standard/stores/${storeParam}/supplies`
        }
      );
    }

    // Gestion des produits
    for (const item of requestedSupplies) {
      const product = await StoreInventory.findOne({ store: store._id, name: item.name });

      if (!product) {
        logger.warn(`Produit '${productName}' introuvable dans le magasin '${storeName}'`);
        return res.status(404).json(
          {
            timestamp: new Date().toISOString(),
            status: 404,
            error: "Not Found",
            message: `Produit '${item.name}' introuvable dans le magasin ${storeParam}`,
            path: `/api/v1/standard/stores/${storeParam}/supplies`
          }
        );
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
    logger.info(`Requete enregistrée avec succès.`);
    res.status(201).json({ message: "Requete enregistrée avec succès." });

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/standard/stores/${storeParam}/supplies`
      }
    );
  }
};
