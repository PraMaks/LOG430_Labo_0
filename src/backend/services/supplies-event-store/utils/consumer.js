const amqp = require('amqplib');
const SupplyEvent = require('../models/SupplyEvent');
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
    const q = await channel.assertQueue('supplies.reappro.queue', { durable: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

    logger.info(`[SUPPLIES-EVENT] En écoute sur "${EXCHANGE_NAME}"`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        const rawEvent = JSON.parse(msg.content.toString());
        logger.info("Événement reçu :", rawEvent);

        const transformedEvent = {
          eventId: rawEvent.eventId,
          type: rawEvent.type,
          timestamp: rawEvent.timestamp,
          aggregateId: rawEvent.aggregateId,
          store: rawEvent.data.store,
          products: (rawEvent.data.products || []).map(p => ({
            name: p.name,
            quantity: p.qty 
          }))
        };

        await SupplyEvent.create(transformedEvent);

        // Metrics Prometheus
        const type = rawEvent.type || 'unknown';

        // Calcul de latence en secondes si timestamp présent
        let latencySeconds = 0;
        if (rawEvent.timestamp) {
          const emittedTime = new Date(rawEvent.timestamp).getTime();
          const now = Date.now();
          latencySeconds = (now - emittedTime) / 1000;
        }

        eventsConsumedCounter.inc({ event_type: type });
        if (latencySeconds > 0) {
          eventLatencyHistogram.observe({ event_type: type }, latencySeconds);
        }
      }
    }, { noAck: true });

  } catch (err) {
    logger.info("[SUPPLIES-EVENT] Erreur au démarrage :", err);
    process.exit(1);
  }
}

module.exports = { startConsumer };