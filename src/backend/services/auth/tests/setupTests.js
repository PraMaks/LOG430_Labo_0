const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('./../utils/logger')

jest.mock('redis', () => require('redis-mock'));
process.env.NODE_ENV = 'test';

let mongoServer;

logger.info('setuptests est lancé')

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await mongoose.connection.close();
  await mongoServer.stop();
});

