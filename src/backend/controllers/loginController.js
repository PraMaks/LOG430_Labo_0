const bcrypt = require('bcrypt');
const User = require('../models/User');

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
      return res.status(401).json({ error: 'Nom d’utilisateur ou mot de passe invalide' });
    }

    const passwordClean = password.trim();
    const passwordMatch = await bcrypt.compare(passwordClean, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Nom d’utilisateur ou mot de passe invalide' });
    }

    const token = generateStaticToken(username);
    tokenStore.set(token, user);

    res.json({
      token,
      username: user.username,
      is_admin: user.is_admin,
      stores: user.stores.map(s => s.name),
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  if (!token || !tokenStore.has(token)) {
    return res.status(403).json({ error: 'Token invalide ou manquant' });
  }

  req.user = tokenStore.get(token);
  next();
}

function logout(req, res) {
  const token = req.headers['authorization'];

  if (tokenStore.has(token)) {
    tokenStore.delete(token);
    return res.json({ message: 'Déconnexion réussie' });
  } else {
    return res.status(400).json({ error: 'Token introuvable' });
  }
}

module.exports = {
  login,
  authenticate,
  logout,
  tokenStore,
};
