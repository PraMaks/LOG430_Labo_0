const Store = require('../models/Store');
const SupplyRequest = require('../models/SupplyRequest');
const logger = require('../utils/logger');
const { publishEvent } = require('../utils/eventPublisher');
const { v4: uuidv4 } = require('uuid');
const { sagaStartedCounter, sagaSuccessCounter, sagaFailureCounter } = require('../metrics/metrics');

exports.postNewSupplyRequestFromStore = async (req, res) => {
  sagaStartedCounter.labels('reapprovisionnement').inc();
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
        path: `/api/v1/supplies/stores/${storeParam}`
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
          path: `/api/v1/supplies/stores/${storeParam}`
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
    sagaSuccessCounter.labels('reapprovisionnement').inc();
    res.status(201).json({ message: "Requete enregistrée avec succès." });

  } catch (err) {
    logger.error(`Erreur de communication avec le serveur`);
    sagaFailureCounter.labels('reapprovisionnement').inc();
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/supplies/stores/${storeParam}`
      }
    );
  }
};

exports.approveSupplyRequest = async (req, res) => {
  sagaStartedCounter.labels('reapprovisionnement').inc();
  const { requestId } = req.params;
  const token = req.headers['authorization'];

  try {
    const supplyRequest = await SupplyRequest.findById(requestId).populate('store');
    if (!supplyRequest) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Demande introuvable`,
          path: `/api/v1/supplies/approve/:requestId`
        }
      );
    }

    const responseCentral = await fetch(`http://krakend:80/api/v1/stocks/stores/StockCentral/true`, {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supplyRequest.products)
    });

    if (!responseCentral.ok) {
      return res.status(responseCentral.status).json({
        timestamp: new Date().toISOString(),
        status: responseCentral.status,
        error: "Stock Central Update Failed",
        message: "Échec de la mise à jour du stock central",
        path: `/api/v1/stocks/stores/StockCentral/true`
      });
    }

    const storeName = supplyRequest.store.name;
    const storeNumber = storeName.split(" ")[1];

    const responseMagasin = await fetch(`http://krakend:80/api/v1/stocks/stores/${storeNumber}/false`, {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supplyRequest.products)
    });

    if (!responseMagasin.ok) {
      await fetch(`http://krakend:80/api/v1/stocks/stores/StockCentral/false`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplyRequest.products)
      });


      return res.status(responseMagasin.status).json({
        timestamp: new Date().toISOString(),
        status: responseMagasin.status,
        error: "Magasin Update Failed",
        message: `Échec de la mise à jour du stock pour le magasin ${storeNumber}`,
        path: `/api/v1/stocks/stores/${storeNumber}/false`
      });
    }

    supplyRequest.status = 'approved';
    await supplyRequest.save();

    await publishEvent({
      type: 'DemandeApprouvee',
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      aggregateId: supplyRequest._id.toString(),
      data: {
        store: supplyRequest.store.name,
        products: supplyRequest.products
      }
    });

    sagaSuccessCounter.labels('reapprovisionnement').inc();
    res.status(200).json({ message: "Demande approuvée avec succès" });
  } catch (err) {
    sagaFailureCounter.labels('reapprovisionnement').inc();
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/supplies/approve/:requestId`
      }
    );
  }
};

exports.rejectSupplyRequest = async (req, res) => {
  sagaStartedCounter.labels('reapprovisionnement').inc();
  const { requestId } = req.params;

  try {
    const supplyRequest = await SupplyRequest.findById(requestId).populate('store');
    if (!supplyRequest) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Demande introuvable`,
          path: `/api/v1/supplies/reject/:requestId`
        }
      );
    }

    supplyRequest.status = 'rejected';
    await supplyRequest.save();

    await publishEvent({
      type: 'DemandeAnnulee',
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      aggregateId: supplyRequest._id.toString(),
      data: {
        store: supplyRequest.store.name,
        products: supplyRequest.products
      }
    });

    sagaSuccessCounter.labels('reapprovisionnement').inc();
    res.status(200).json({ message: "Demande rejetée avec succès" });
  } catch (err) {
    sagaFailureCounter.labels('reapprovisionnement').inc();
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/supplies/reject/:requestId`
      }
    );
  }
};

exports.getPendingSupplyRequests = async (req, res) => {
  try {
    const pendingRequests = await SupplyRequest.find({ status: 'pending' }).populate('store');
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/supplies/pending`
      }
    );
  }
};
