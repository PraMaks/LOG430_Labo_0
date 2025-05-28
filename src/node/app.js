const express = require('express');
const mongoose = require('mongoose');
const StoreInventory = require('./models/StoreInventory');
const StoreSale = require('./models/StoreSale')

const app = express();
const port = 3000;

// Connexion à MongoDB locale
mongoose.connect('mongodb://127.0.0.1:27017/labo1')
.then(() => console.log('Connecté à MongoDB'))
.catch((err) => console.error('Erreur de connexion MongoDB:', err));

// Middleware pour parser le JSON
app.use(express.json());

// Routes simples
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/about', (req, res) => {
    res.send('Welcome to about us page');
});

app.get('/contact', (req, res) => {
    res.send('Welcome to contact us page');
});

app.get('/products', async (req, res) => {
    try {
        const produits = await StoreInventory.find(); 
        res.json(produits);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});

app.get('/sales', async (req, res) => {
    try {
        const ventes = await StoreSale.find();
        console.log(ventes);
        res.json(ventes);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des ventes' });
    }
});

app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
