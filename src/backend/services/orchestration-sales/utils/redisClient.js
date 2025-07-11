const redis = require('redis');
const logger = require('./logger');

let redisClient;

if (process.env.NODE_ENV === 'test') {
  // Mock Redis avec redis-mock
  const redisMock = require('redis-mock');
  redisClient = redisMock.createClient();
  redisClient.connect = async () => {}; // simule .connect()
  redisClient.quit = async () => {};
  logger.info('Client Redis mocké pour les tests');
} else {
  // Client Redis réel
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'redis',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    }
  });

  redisClient.connect()
    .then(() => logger.info('Connecté à Redis'))
    .catch((err) => logger.error('Erreur de connexion à Redis:', err));
}

module.exports = redisClient;
