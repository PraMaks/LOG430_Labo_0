const amqp = require('amqplib');
const logger = require('./logger');
const { eventsPublishedCounter } = require('../metrics/metrics');

let channel;

async function connect() {
  const connection = await amqp.connect('amqp://rabbitmq');
  try {
    channel = await connection.createChannel();

    await channel.assertExchange('reapprovisionnement.events', 'fanout', { durable: true });

    // Écoute les messages non routés
    channel.on('return', (msg) => {
      const event = JSON.parse(msg.content.toString());
      logger.error(`[RabbitMQ] Message NON routé vers une queue ! Type: ${event.type}`);
    });
  } catch (err) {
    logger.error("[RABBITMQ] Impossible de se connecter ou créer le channel :", err);
    throw err;
  }
}

async function publishEvent(event) {
  if (!channel) {
    await connect();
  }

  const sent = channel.publish(
    'reapprovisionnement.events',
    '',
    Buffer.from(JSON.stringify(event)),
    { mandatory: true } // Permet à RabbitMQ de retourner les messages non routés
  );

  if (!sent) {
    logger.warn(`[RabbitMQ] Le message n'a pas pu être envoyé dans le buffer`);
  }

  eventsPublishedCounter.labels(event.type).inc();
  logger.info(`[RabbitMQ] Event publié : ${event.type}`);
}

module.exports = { publishEvent };