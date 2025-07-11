const bcrypt = require('bcrypt');
const User = require('../models/User');
const logger = require('../utils/logger');
const redisClient = require('../utils/redisClient');

function generateStaticToken(username) {
  return `token-${username}-${Date.now()}`;
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).populate('stores');
    if (!user) {
      logger.warn(`Nom d’utilisateur ou mot de passe invalide`);
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: "Unauthorized",
        message: "Nom d’utilisateur ou mot de passe invalide",
        path: "/api/v1/auth/users/login"
      });
    }

    const passwordClean = password.trim();
    const passwordMatch = await bcrypt.compare(passwordClean, user.password);
    if (!passwordMatch) {
      logger.warn(`Nom d’utilisateur ou mot de passe invalide`);
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: "Unauthorized",
        message: "Nom d’utilisateur ou mot de passe invalide",
        path: "/api/v1/auth/users/login"
      });
    }

    const token = generateStaticToken(username);

    // Stocker dans Redis avec expiration (ex: 1 heure = 3600 secondes)
    // Stocker les données user sérialisées en JSON
    await redisClient.set(token, JSON.stringify({
      username: user.username,
      type: user.type,
      stores: user.stores.map(s => s.name),
      // tu peux ajouter plus d'infos utiles ici si besoin
    }), {
      EX: 3600 // durée de vie en secondes du token
    });

    logger.info(`Login reussi`);
    res.json({
      token,
      username: user.username,
      type: user.type,
      stores: user.stores.map(s => s.name),
    });
  } catch (error) {
    logger.error(`Erreur de communication avec le serveur`, error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur de communication avec le serveur",
      path: "/api/v1/auth/users/login"
    });
  }
}

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

async function logout(req, res) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: "Bad Request",
      message: "Token manquant",
      path: "/api/v1/auth/users/logout"
    });
  }

  try {
    const result = await redisClient.del(token);
    if (result === 1) {
      logger.info(`Déconnexion réussie`);
      return res.json({ message: 'Déconnexion réussie' });
    } else {
      logger.warn(`Token invalide`);
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Token invalide",
        path: "/api/v1/auth/users/logout"
      });
    }
  } catch (err) {
    logger.error('Erreur Redis lors de la déconnexion', err);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur serveur interne",
      path: "/api/v1/auth/users/logout"
    });
  }
}

async function register(req, res) {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username: username });

    if (!user) {
      user = new User({
        username: username,
        password: password,
        rank: 0,
      });
      await user.save();
      logger.info(`Utilisateur '${user.username}' créé.`);
      return res.status(200).json({ message: "Utilisateur créé avec succès." });
    } else {
      logger.info(`Utilisateur '${user.username}' déjà existant.`);
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Nom d'utilisateur déjà existant, choississez un autre",
        path: "/api/v1/auth/users/register"
      });
    }

  } catch (error) {
    logger.error(`Erreur de communication avec le serveur`, error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur de communication avec le serveur",
      path: "/api/v1/auth/users/register"
    });
  }
}


module.exports = {
  login,
  authenticate,
  logout,
  register,
};
