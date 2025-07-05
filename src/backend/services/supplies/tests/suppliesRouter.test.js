const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const suppliesRouter = require('../routes/suppliesRouter');
const Store = require('../models/Store');
const SupplyRequest = require('../models/SupplyRequest');
const redisClient = require('../utils/redisClient');

// Simule le fetch vers l'autre service (à la place de node-fetch)
global.fetch = jest.fn();

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