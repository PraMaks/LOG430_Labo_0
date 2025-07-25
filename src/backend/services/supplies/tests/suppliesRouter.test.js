const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const suppliesRouter = require('../routes/suppliesRouter');
const Store = require('../models/Store');
const SupplyRequest = require('../models/SupplyRequest');
const redisClient = require('../utils/redisClient');

// Simule le fetch vers l'autre service (à la place de node-fetch)
global.fetch = jest.fn();

// Mock RabbitMQ publisher
jest.mock('../utils/eventPublisher', () => ({
  publishEvent: jest.fn(),
}));

const { publishEvent } = require('../utils/eventPublisher');

const app = express();
app.use(express.json());
app.use('/api/v1/supplies', suppliesRouter);

describe('POST /stores/:storeNumber', () => {
  let store;

  beforeEach(async () => {
    // On nettoie les mocks
    jest.clearAllMocks();

    // Créer un magasin dans la BD in-memory
    store = new Store({
      name: 'Magasin 1',
      nb_requests: 0,
      is_store: true,
      address: 'test'
    });
    await store.save();

    // Mock fetch pour simuler une réponse 200 OK du stock-service
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ message: 'OK' }),
        text: async () => 'OK',
      })
    );
  });

  afterEach(async () => {
    await Store.deleteMany({});
    await SupplyRequest.deleteMany({});
  });

  it("ne devrait pas créer une requête d'approvisionnement et retourner 500", async () => {
    const token = 'token-test-123';
    const data = [
      { name: 'Produit A', quantity: 10 },
      { name: 'Produit B', quantity: 5 },
    ];

    const response = await request(app)
      .post('/api/v1/supplies/stores/1')
      .set('Authorization', token)
      .send(data);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toMatch("Erreur de communication avec le serveur");
  });
});

describe('PATCH /api/v1/supplies/reject/:requestId', () => {
  let store;
  let supplyRequest;

  beforeEach(async () => {
    jest.clearAllMocks();

    store = await Store.create({
      name: 'Magasin Test',
      nb_requests: 0,
      is_store: true,
      address: 'Adresse Test',
    });

    supplyRequest = await SupplyRequest.create({
      store: store._id,
      status: 'pending',
      products: [{ name: 'Produit A', qty: 2 }], 
    });
  });

  afterEach(async () => {
    await Store.deleteMany({});
    await SupplyRequest.deleteMany({});
  });

  it('devrait rejeter une demande existante et publier un événement', async () => {
    const response = await request(app).patch(`/api/v1/supplies/reject/${supplyRequest._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Demande rejetée avec succès");

    const updated = await SupplyRequest.findById(supplyRequest._id);
    expect(updated.status).toBe('rejected');

    expect(publishEvent).toHaveBeenCalledTimes(1);
    expect(publishEvent.mock.calls[0][0].type).toBe('DemandeAnnulee');
  });

  it('devrait retourner 404 si la demande est introuvable', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app).patch(`/api/v1/supplies/reject/${fakeId}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Demande introuvable");

    expect(publishEvent).not.toHaveBeenCalled();
  });
});