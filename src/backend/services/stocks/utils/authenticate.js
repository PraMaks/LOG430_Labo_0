const logger = require('./logger');
const redisClient = require('./redisClient');

async function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  if (process.env.NODE_ENV === 'test') {
    // Bypass l'authentification en test
    req.user = {
    "token": "token-admin-1751734873902",
    "username": "admin",
    "type": "admin",
    "stores": [
        "Magasin 1",
        "Magasin 2",
        "Magasin 3",
        "Magasin 4",
        "Magasin 5",
        "Magasin Central"
    ]
    }; // données fictives
    return next();
  }

  if (!token) {
    logger.warn(`Token manquant`);
    return res.status(403).json({
      timestamp: new Date().toISOString(),
      status: 403,
      error: "Forbidden",
      message: "Token manquant",
      path: "/api/v1/"
    });
  }

  try {
    const userData = await redisClient.get(token);
    if (!userData) {
      logger.warn(`Token invalide ou expiré`);
      return res.status(403).json({
        timestamp: new Date().toISOString(),
        status: 403,
        error: "Forbidden",
        message: "Token invalide ou expiré",
        path: "/api/v1/"
      });
    }

    req.user = JSON.parse(userData);
    next();

  } catch (err) {
    logger.error('Erreur Redis lors de l’authentification', err);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur serveur interne",
      path: "/api/v1/"
    });
  }
}

module.exports = {
  authenticate,
};
