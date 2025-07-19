const amqplib = require('amqplib');
const consumer = require('../utils/consumer');
const logger = require('../utils/logger');

jest.mock('amqplib');
jest.mock('../utils/logger');

function createMockChannel() {
  return {
    assertExchange: jest.fn(),
    assertQueue: jest.fn().mockResolvedValue({ queue: 'notif.reappro.queue' }),
    bindQueue: jest.fn(),
    consume: jest.fn((queue, onMessage) => {
      const mockMsg = {
        content: Buffer.from(JSON.stringify({
          eventId: 'abc123',
          type: 'SUPPLY_REQUEST_CREATED',
          data: { storeId: '123', requestId: 'req1' }
        }))
      };
      onMessage(mockMsg);
    })
  };
}

function createMockConnection(channel) {
  return {
    createChannel: jest.fn().mockResolvedValue(channel)
  };
}

describe('startConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait consommer un événement RabbitMQ et logger les informations', async () => {
    const mockChannel = createMockChannel();
    const mockConnection = createMockConnection(mockChannel);
    amqplib.connect.mockResolvedValue(mockConnection);

    await consumer.startConsumer();

    const eventLog = logger.info.mock.calls.find(
      call => call.some(arg => typeof arg === 'object' && arg?.type === 'SUPPLY_REQUEST_CREATED')
    );

    expect(eventLog).toBeDefined(); // ✅ le log contient bien l'objet attendu
  });
  
});
