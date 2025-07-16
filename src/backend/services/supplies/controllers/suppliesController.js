const Store = require('../models/Store');
const SupplyRequest = require('../models/SupplyRequest');
const logger = require('../utils/logger');
const { publishEvent } = require('../utils/eventPublisher');
const { v4: uuidv4 } = require('uuid');

exports.postNewSupplyRequestFromStore = async (req, res) => {
  const requestedSupplies = req.body;
  const storeParam = req.params.storeNumber;

  const token = req.headers['authorization'];

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

    // Gestion de la requete
    const supplyRequest = new SupplyRequest({
      store: store._id,
      products: requestedSupplies
    });
    await supplyRequest.save();

    await publishEvent({
      type: 'DemandeReapprovisionnementCreee',
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      aggregateId: supplyRequest._id.toString(),
      data: {
        store: store.name,
        products: requestedSupplies
      }
    });


    await Store.updateOne(
      { _id: store._id },
      { $inc: { nb_requests: 1 } }
    );

    const response = await fetch(`http://krakend:80/api/v1/stocks/stores/${storeParam}/supply`, {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supplyRequest)
    });

    if (!response.ok) {
      const data = await response.json();
      logger.error(`Erreur retour du stock-service: ${response.status} → ${data.message || JSON.stringify(data)}`);
      throw new Error(`Stock service responded with ${response.status}: ${data.message}`);
    }

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
