const logger = require('../utils/logger');

exports.postNewSaleEvent = async (req, res) => {
  const storeParam = req.params.storeNumber;
  const user = req.params.user;

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
        path: `/api/v1/orchestr-sales/stores/${storeParam}`
      }
    );
  }

  try { 
    logger.info(`Appel reçu avec succès.`);
    logger.info(user)

    // ÉTAPE 1 : Récuperer le panier
    logger.info("ÉTAPE 1 : Récuperer le panier")
    let responseStep1;
    let cartContents;
    if(isStock) {
        responseStep1 = await fetch(`http://krakend:80/api/v1/stocks/${user}/cart`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
      });

      if (!responseStep1.ok) {
        const data = await responseStep1.json();
        logger.error(`Erreur retour du stock-service: ${responseStep1.status} → ${data.message || JSON.stringify(data)}`);
        throw new Error(`Stock service responded with ${responseStep1.status}: ${data.message}`);
      }

      const data = await responseStep1.json();
      cartContents = data.contents;
      logger.info("Réponse JSON du service stock :");
      logger.info(cartContents);

      //TODO Ajouter succes step1
    }

    // ÉTAPE 2 : Faire la vente
    logger.info("ÉTAPE 2 : Enregistrer la vente")
    let responseStep2;
    if(isStock) {
        responseStep2 = await fetch(`http://krakend:80/api/v1/sales/stores/${storeParam}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartContents)
      });

      if (!responseStep2.ok) {
        const data = await responseStep2.json();
        logger.error(`Erreur retour du sales-service: ${responseStep2.status} → ${data.message || JSON.stringify(data)}`);
        throw new Error(`Stock service responded with ${responseStep2.status}: ${data.message}`);
      }

      const data = await responseStep2.json();
      logger.info("Réponse JSON du service stock :");
      logger.info(data);

      //TODO Ajouter succes step2
    }

    // ÉTAPE 3 : MAJ inventaire
    logger.info("ÉTAPE 3 : MAJ de l'inventaire")
    let responseStep3;
    if(isStock) {
        responseStep3 = await fetch(`http://krakend:80/api/v1/stocks/stores/${storeParam}/true`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartContents)
      });

      if (!responseStep3.ok) {
        const data = await responseStep3.json();
        logger.error(`Erreur retour du stock-service: ${responseStep3.status} → ${data.message || JSON.stringify(data)}`);
        throw new Error(`Stock service responded with ${responseStep3.status}: ${data.message}`);
      }

      const data = await responseStep3.json();
      logger.info("Réponse JSON du service stock :");
      logger.info(data);

      //TODO Ajouter succes step2
    }

    // ÉTAPE 4 : Increase rank
    logger.info("ÉTAPE 4 : Increase rank")
    let responseStep4;
    if(isStock) {
        responseStep4 = await fetch(`http://krakend:80/api/v1/auth/users/${user}/rank`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
      });

      if (!responseStep4.ok) {
        const data = await responseStep4.json();
        logger.error(`Erreur retour du auth-service: ${responseStep4.status} → ${data.message || JSON.stringify(data)}`);
        throw new Error(`Stock service responded with ${responseStep4.status}: ${data.message}`);
      }

      const data = await responseStep4.json();
      logger.info("Réponse JSON du service stock :");
      logger.info(data);

      //TODO Ajouter succes step2
    }


    res.status(201).json({ message: "Vente enregistrée avec succès." });
  } catch (err) {
    logger.error(`Erreur de communication avec le serveur: ${err}`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/orchestr-sales/stores/${storeParam}`
      }
    );
  }
};
