const amqp = require('amqplib');
const logger = require('./logger');
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
    const q = await channel.assertQueue('notif.reappro.queue', { durable: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

    logger.info(`[NOTIF] En écoute sur "${EXCHANGE_NAME}"`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        const event = JSON.parse(msg.content.toString());
        logger.info("Événement reçu :", event);

        // Récupérer le type d'event (assumons event.type existe)
        const type = event.type || 'unknown';

        // Calcul de la latence si timestamp d’émission présent (en ms)
        // Exemple : event.timestamp ou event.emittedAt
        let latencySeconds = 0;
        if (event.timestamp) {
          const emittedTime = new Date(event.timestamp).getTime();
          const now = Date.now();
          latencySeconds = (now - emittedTime) / 1000;
        }

        // Incrémenter compteur avec label event_type
        eventsConsumedCounter.inc({ event_type: type });

        // Enregistrer la latence
        if (latencySeconds > 0) {
          eventLatencyHistogram.observe({ event_type: type }, latencySeconds);
        }

        // Simulation de notification
        logger.info("Simulation de notification d'event");
        logger.info(event);
      }
    }, { noAck: true });

  } catch (err) {
    logger.info("[NOTIF] Erreur au démarrage :", err);
    process.exit(1);
  }
}

module.exports = { startConsumer, connectWithRetry };
