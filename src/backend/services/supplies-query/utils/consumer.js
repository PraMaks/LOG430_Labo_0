const amqp = require('amqplib');
const SupplyProjection = require('../models/SupplyProjection');
const logger = require('../utils/logger');
const { eventsConsumedCounter, eventLatencyHistogram } = require('../metrics/metrics');

const RABBITMQ_URL = 'amqp://rabbitmq';
const EXCHANGE_NAME = 'reapprovisionnement.events';

async function connectWithRetry(maxRetries = 30, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await amqp.connect(RABBITMQ_URL);
    } catch {
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
    const q = await channel.assertQueue('supplies.query.queue', { durable: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

    logger.info(`[SUPPLIES-QUERY] En écoute sur "${EXCHANGE_NAME}"`);

    channel.consume(q.queue, async (msg) => {
      if (!msg.content) return;

      const evt = JSON.parse(msg.content.toString());
      logger.info("Événement reçu :", evt);

      const { aggregateId, type, data, timestamp } = evt;

      if (type === 'DemandeReapprovisionnementCreee') {
        await SupplyProjection.findOneAndUpdate(
          { aggregateId },
          {
            aggregateId,
            store: data.store,
            products: (data.products || []).map(p => ({ name: p.name, quantity: p.qty })),
            status: 'créée'
          },
          { upsert: true, new: true }
        );
      } else if (type === 'DemandeApprouvee') {
        await SupplyProjection.updateOne({ aggregateId }, { status: 'approuvée' });
      } else if (type === 'DemandeAnnulee') {
        await SupplyProjection.updateOne({ aggregateId }, { status: 'annulée' });
      }

      // Metrics Prometheus
      const eventType = type || 'unknown';

      // Calcul de latence si timestamp disponible
      let latencySeconds = 0;
      if (timestamp) {
        const emittedTime = new Date(timestamp).getTime();
        const now = Date.now();
        latencySeconds = (now - emittedTime) / 1000;
      }

      eventsConsumedCounter.inc({ event_type: eventType });
      if (latencySeconds > 0) {
        eventLatencyHistogram.observe({ event_type: eventType }, latencySeconds);
      }

    }, { noAck: true });

  } catch (err) {
    logger.error("[SUPPLIES-QUERY] Erreur au démarrage :", err);
    process.exit(1);
  }
}

module.exports = { startConsumer };