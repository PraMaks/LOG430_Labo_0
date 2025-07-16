const amqp = require('amqplib');
const logger = require('./logger');

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
        logger.info("Simulation de notification d'event")
        logger.info(event);
      }
    }, { noAck: true });

  } catch (err) {
    logger.info("[NOTIF] Erreur au démarrage :", err);
    process.exit(1);
  }
}

module.exports = { startConsumer };