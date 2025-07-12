const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const EventSale = require('../models/event');
const orchestrRouter = require('../routes/orchestrationSalesRouter');

global.fetch = jest.fn();

const app = express();
app.use(express.json());
app.use('/api/v1/orchestr-sales', orchestrRouter);

describe('POST /api/v1/orchestr-sales/stores/:storeNumber/:user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait enregistrer tous les événements jusqu’à CommandeConfirmee', async () => {
    const token = 'token-user-xyz';
    const mockCart = [
      { name: 'test', description: 'desc', qty: 1, price: 10, total_price: 10 }
    ];

    // Mock fetch successifs
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ contents: mockCart }) }) // étape 1
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: "Vente ok" }) }) // étape 2
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: "Inventaire ok" }) }) // étape 3
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: "Rank ok" }) }); // étape 4

    const response = await request(app)
      .post('/api/v1/orchestr-sales/stores/StockCentral/john')
      .set('Authorization', token);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toMatch(/succès/);

    const events = await EventSale.find().sort({ date: 1 });
    expect(events.length).toBe(1); // Un seul document mis à jour
    expect(events[0].type).toBe('CommandeConfirmee');
    expect(events[0].details).toMatch(/Vente enregistrée avec 1 produits/);
  });

  it('devrait enregistrer un événement annulé à l’étape 2', async () => {
    const token = 'token-user-xyz';
    const mockCart = [
      { name: 'test', description: 'desc', qty: 1, price: 10, total_price: 10 }
    ];

    // Mock fetch pour fail à l'étape 2
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ contents: mockCart }) }) // étape 1
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: "Fail" }) }); // étape 2

    const response = await request(app)
      .post('/api/v1/orchestr-sales/stores/StockCentral/john')
      .set('Authorization', token);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toMatch("Erreur survenue lors de l'ÉTAPE 2");

  });

  it('devrait retourner 400 pour un storeNumber invalide', async () => {
    const response = await request(app)
      .post('/api/v1/orchestr-sales/stores/99/john')
      .set('Authorization', 'some-token');

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Numéro de magasin invalide/);
  });
});
