const amqp = require('amqplib');

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

  console.log("📤 Event publié :", event.type);
}

module.exports = { publishEvent };