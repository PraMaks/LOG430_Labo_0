const express = require('express');
const mongoose = require('mongoose');
const initDb = require('./initDb'); 
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
const standardRouter = require('./routes/standardRouter');
const adminRouter = require('./routes/adminRouter');
const authRouter = require('./routes/authRouter');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Magasin',
      version: '1.0.0',
      description: 'Documentation de l\'API de gestion de magasins',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [__dirname + '/routes/*.js'], // Pour inclure tout les fichiers de route
};

const swaggerSpec = swaggerJsdoc(options);


// Fonction de démarrage
async function startServer() {
  try {
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    const mongoPort = process.env.MONGO_PORT || '27017';
    const mongoUrl = `mongodb://${mongoHost}:${mongoPort}/labo3`;
    await mongoose.connect(mongoUrl);
    console.log('Connecté à MongoDB');

    await initDb(); 

    app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/api/v1/standard', standardRouter);
    app.use('/api/v1/admin', adminRouter);
    app.use('/api/v1/auth', authRouter);
    

    app.listen(port, () => {
      console.log(`Serveur lancé sur http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Erreur de démarrage du serveur :', err);
  }
}

startServer();
