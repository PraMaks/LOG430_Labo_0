const bcrypt = require('bcrypt');
const User = require('../models/User');
const logger = require('../utils/logger');

// Simple table de tokens en mémoire (clé: token, valeur: user)
const tokenStore = new Map();

function generateStaticToken(username) {
  return `token-${username}-${Date.now()}`;
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).populate('stores');
    if (!user) {
      logger.warn(`Nom d’utilisateur ou mot de passe invalide`);
      return res.status(401).json(
        {
          timestamp: new Date().toISOString(),
          status: 401,
          error: "Unauthorized",
          message: "Nom d’utilisateur ou mot de passe invalide",
          path: "/api/v1/auth/users/login"
        }
      );
    }

    const passwordClean = password.trim();
    const passwordMatch = await bcrypt.compare(passwordClean, user.password);
    if (!passwordMatch) {
      logger.warn(`Nom d’utilisateur ou mot de passe invalide`);
      return res.status(401).json(
        {
          timestamp: new Date().toISOString(),
          status: 401,
          error: "Unauthorized",
          message: "Nom d’utilisateur ou mot de passe invalide",
          path: "/api/v1/auth/users/login"
        }
      );
    }

    const token = generateStaticToken(username);
    tokenStore.set(token, user);

    logger.info(`Login reussi`);
    res.json({
      token,
      username: user.username,
      is_admin: user.is_admin,
      stores: user.stores.map(s => s.name),
    });
  } catch (error) {
    logger.err(`Erreur de communication avec le serveur`);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: "/api/v1/auth/users/login"
      }
    );
  }
}

function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  if (!token || !tokenStore.has(token)) {
    logger.warn(`Token invalide ou manquant`);
    return res.status(403).json(
      {
        timestamp: new Date().toISOString(),
        status: 403,
        error: "Forbidden",
        message: "Token invalide ou manquant",
        path: "/api/v1/"
      }
    );
  }

  req.user = tokenStore.get(token);
  next();
}

function logout(req, res) {
  const token = req.headers['authorization'];

  if (tokenStore.has(token)) {
    tokenStore.delete(token);
    logger.info(`Déconnexion réussie`);
    return res.json({ message: 'Déconnexion réussie' });
  } else {
    logger.warn(`Token invalide`);
    return res.status(400).json(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Token invalide",
        path: "/api/v1/auth/users/logout"
      }
    );
  }
}

module.exports = {
  login,
  authenticate,
  logout,
  tokenStore,
};
