const express = require('express');
const logger = require('./utils/logger');
const promBundle = require('express-prom-bundle');
const { startConsumer } = require('./utils/consumer');

const app = express();
const port = 3070;

// Middleware pour parser le JSON
app.use(express.json());

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

// Fonction de démarrage
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      startConsumer();
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
