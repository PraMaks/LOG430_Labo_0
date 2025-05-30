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

// Fonction de démarrage
async function startServer() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/labo2');
    console.log('Connecté à MongoDB');

    await initDb(); 

    app.use('/', storeRoutes);
    app.use('/admin', adminRoutes);

    app.listen(port, () => {
      console.log(`Serveur lancé sur http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Erreur de démarrage du serveur :', err);
  }
}

startServer();
