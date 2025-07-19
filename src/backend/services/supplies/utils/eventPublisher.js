const amqp = require('amqplib');
const logger = require('./logger');
const { eventsPublishedCounter } = require('../metrics/metrics');

let channel;

async function connect() {
  const connection = await amqp.connect('amqp://rabbitmq');
  channel = await connection.createChannel();
  await channel.assertExchange('reapprovisionnement.events', 'fanout', { durable: true });
}

async function publishEvent(event) {
  if (!channel) {
    await connect();
  }

  channel.publish(
    'reapprovisionnement.events',
    '',
    Buffer.from(JSON.stringify(event))
  );

  eventsPublishedCounter.labels(event.type).inc();
  logger.info("Event publié :", event.type);
}

module.exports = { publishEvent };