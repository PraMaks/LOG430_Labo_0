const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const SupplyEvent = require('../models/SupplyEvent');
const suppliesEventRouter = require('../routes/suppliesEventRouter');

// Création de l'app Express
const app = express();
app.use(express.json());
app.use('/api/v1/suppliesState', suppliesEventRouter);

describe('GET /api/v1/suppliesState/state/:aggregateId', () => {
  beforeEach(async () => {
    await SupplyEvent.deleteMany({});
  });

  it('devrait reconstituer correctement l’état avec les événements en ordre', async () => {
    const aggregateId = 'agg-001';

    await SupplyEvent.create([
      {
        eventId: 'evt-1',
        type: 'DemandeReapprovisionnementCreee',
        timestamp: '2024-01-01T10:00:00Z',
        aggregateId,
        store: 'store-123',
        products: [{ name: 'Produit A', quantity: 5 }]
      },
      {
        eventId: 'evt-2',
        type: 'DemandeApprouvee',
        timestamp: '2024-01-01T12:00:00Z',
        aggregateId
      }
    ]);

    const res = await request(app).get(`/api/v1/suppliesState/state/${aggregateId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: aggregateId,
      status: 'approuvée',
      products: [{ name: 'Produit A', quantity: 5 }],
      store: 'store-123'
    });
  });

  it('devrait retourner un état vide si aucun événement pour cet aggregateId', async () => {
    const res = await request(app).get('/api/v1/suppliesState/state/inconnu');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: 'inconnu',
      status: null,
      products: [],
      store: null
    });
  });

  it('devrait retourner une erreur 500 si une exception se produit', async () => {
    jest.spyOn(SupplyEvent, 'find').mockImplementation(() => {
      throw new Error('Erreur Mongo simulée');
    });

    const res = await request(app).get('/api/v1/suppliesState/state/agg-err');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Erreur lors du replay');

    SupplyEvent.find.mockRestore();
  });
});
