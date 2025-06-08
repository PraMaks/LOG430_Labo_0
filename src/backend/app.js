const express = require('express');
const mongoose = require('mongoose');
const initDb = require('./initDb'); 

const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Routes
const storeRoutes = require('./routes/storeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const loginRoutes = require('./routes/loginRoutes');

// Fonction de démarrage
async function startServer() {
  try {
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    const mongoPort = process.env.MONGO_PORT || '27017';
    const mongoUrl = `mongodb://${mongoHost}:${mongoPort}/labo3`;
    await mongoose.connect(mongoUrl);
    console.log('Connecté à MongoDB');

    await initDb(); 

    app.use('/', storeRoutes);
    app.use('/admin', adminRoutes);
    app.use('/login', loginRoutes);

    app.listen(port, () => {
      console.log(`Serveur lancé sur http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Erreur de démarrage du serveur :', err);
  }
}

startServer();
