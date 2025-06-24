const express = require('express');
const mongoose = require('mongoose');
const initDb = require('./initDb'); 
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('./utils/logger');
const promBundle = require('express-prom-bundle');

const app = express();
const port = 3010;

// Middleware pour parser le JSON
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  promClient: {
    collectDefaultMetrics: {},
  }
});

app.use(metricsMiddleware);

app.use((req, res, next) => {
  logger.info(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
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
        url: 'http://localhost:3001',
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

app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/auth', authRouter);

// Fonction de démarrage
async function startServer() {
  try {
    const mongoHost = process.env.MONGO_HOST || 'localhost';
    const mongoPort = process.env.MONGO_PORT || '27017';
    const mongoUrl = `mongodb://${mongoHost}:${mongoPort}/labo5`;
    await mongoose.connect(mongoUrl);
    logger.info('Connecté à MongoDB');

    if (process.env.NODE_ENV !== 'test') {
      await initDb();
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(port, () => {
        logger.info(`Serveur lancé sur http://localhost:${port}`);
      });
    }

  } catch (err) {
    logger.error('Erreur de démarrage du serveur :', err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
