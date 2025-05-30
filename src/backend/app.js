const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connexion à MongoDB locale
mongoose.connect('mongodb://127.0.0.1:27017/labo2')
.then(() => console.log('Connecté à MongoDB'))
.catch((err) => console.error('Erreur de connexion MongoDB:', err));

// Middleware pour parser le JSON
app.use(express.json());

// Routes
const storeRoutes = require('./routes/storeRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Montage des routes
app.use('/', storeRoutes);     
app.use('/admin', adminRoutes);   

app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
