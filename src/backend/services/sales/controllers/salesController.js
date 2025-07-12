const Store = require('../models/Store');
const StoreSale = require('../models/StoreSale');
const logger = require('../utils/logger');

exports.postNewSaleInStore = async (req, res) => {
  const soldProducts = req.body;
  const storeParam = req.params.storeNumber;

  const token = req.headers['authorization'];

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
        path: `/api/v1/sales/stores/${storeParam}`
      }
    );
  }

  try { 
    // On cherche le magasin
    let storeName;

    if (!isStock) {
      storeName = `Magasin ${storeParam}`; 
    } else {
      storeName = 'Stock Central'
    } 
    const store = await Store.findOne({ name: storeName });
    if (!store) {
      logger.warn(`Magasin '${storeName}' introuvable`);
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Magasin '${storeName}' introuvable`,
          path: `/api/v1/sales/stores/${storeParam}`
        }
      );
    }
    
    // Gestion des produits
    let totalPrice = 0;
    for (const item of soldProducts) {
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
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/sales/stores/${storeParam}`
      }
    );
  }
};

exports.getSalesByStore = async (req, res) => {
  const storeParam = req.params.storeNumber;

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
        path: `/api/v1/sales/stores/${storeParam}`
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
          path: `/api/v1/sales/stores/${storeParam}`
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
    logger.error(`Erreur de communication avec le serveur: ${err.message}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/sales/stores/${storeParam}`
      }
    );
  }
};

exports.deleteSaleByStore = async (req, res) => {
  const saleId = req.params.saleId;
  const storeParam = req.params.storeNumber;
  const token = req.headers['authorization'];

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
        path: `/api/v1/sales/stores/${storeParam}/${saleId}`
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
          path: `/api/v1/sales/stores/${storeParam}/${saleId}`
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
          path: `/api/v1/sales/stores/${storeParam}/${saleId}`
        }
      );
    }

    // Appel au service stock pour remettre les produits en stock
    logger.info(`Retour de vente: envoi PATCH à stocks-service via krakend`);
    logger.info(`Contenu de la vente à restituer : ${JSON.stringify(sale.contents)}`);

    const response = await fetch(`http://krakend:80/api/v1/stocks/stores/${storeParam}/false`, {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sale.contents)
    });

    if (!response.ok) {
      const data = await response.json();
      logger.error(`Erreur retour du stock-service: ${response.status} → ${data.message || JSON.stringify(data)}`);
      throw new Error(`Stock service responded with ${response.status}: ${data.message}`);
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
        path: `/api/v1/sales/stores/${storeParam}/${saleId}`
      }
    );
  }
};

exports.deleteMostRecentSaleForStore = async (req, res) => {
  const storeParam = req.params.storeNumber;
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
        path: `/api/v1/sales/stores/${storeParam}/${saleId}`
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
      return false;
    }

    const deletedSale = await StoreSale.findOneAndDelete(
      { store: store._id },
      { sort: { date: -1 } } 
    );

    if (!deletedSale) {
      logger.warn(`Aucune vente à supprimer pour le magasin '${storeName}'`);
      return false;
    }

    logger.info(`Vente la plus récente supprimée pour le magasin '${storeName}'`);
    return true;
  } catch (error) {
    logger.error(`Erreur lors de la suppression de la vente :`, error);
    throw error;
  }
}