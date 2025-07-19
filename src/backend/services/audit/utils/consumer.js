const amqp = require('amqplib');
const EventLog = require('../models/EventLog');
const logger = require('../utils/logger');
const { eventsConsumedCounter, eventLatencyHistogram } = require('../metrics/metrics');

const RABBITMQ_URL = 'amqp://rabbitmq';
const EXCHANGE_NAME = 'reapprovisionnement.events';

async function connectWithRetry(maxRetries = 30, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      return connection;
    } catch (err) {
      logger.warn(`Tentative ${i + 1}/${maxRetries} : RabbitMQ pas prêt...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Impossible de se connecter à RabbitMQ après plusieurs tentatives");
}

async function startConsumer() {
  try {
    const conn = await connectWithRetry();
    const channel = await conn.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
    const q = await channel.assertQueue('audit.reappro.queue', { durable: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

    logger.info(`[AUDIT] En écoute sur "${EXCHANGE_NAME}"`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        const event = JSON.parse(msg.content.toString());
        logger.info("Événement reçu :", event);

        // Sauvegarde dans la base MongoDB
        await EventLog.create(event);

        // Extraction du type d'événement
        const type = event.type || 'unknown';

        // Calcul de la latence (en secondes) si timestamp présent
        let latencySeconds = 0;
        if (event.timestamp) {
          const emittedAt = new Date(event.timestamp);
          const now = new Date();
          latencySeconds = (now - emittedAt) / 1000;
        }

        // Incrémenter les métriques Prometheus
        eventsConsumedCounter.inc({ event_type: type });
        eventLatencyHistogram.observe({ event_type: type }, latencySeconds);
      }
    }, { noAck: true });

  } catch (err) {
    logger.info("[AUDIT] Erreur au démarrage :", err);
    process.exit(1);
  }
}

module.exports = { startConsumer };