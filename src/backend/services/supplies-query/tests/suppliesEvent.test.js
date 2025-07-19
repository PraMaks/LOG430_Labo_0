const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const SupplyProjection = require('../models/SupplyProjection');
const suppliesQueryRouter = require('../routes/suppliesQueryRouter');

global.fetch = jest.fn(); // mock de fetch

const app = express();
app.use(express.json());
app.use('/api/v1/suppliesQuery', suppliesQueryRouter);

describe('supplies-query routes', () => {
  beforeEach(async () => {
    await SupplyProjection.deleteMany({});
    jest.clearAllMocks();
  });

  describe('GET /supplies', () => {
    it('devrait retourner toutes les projections', async () => {
      await SupplyProjection.create([
        { aggregateId: 'agg1', store: 'store1', status: 'créée', products: [] },
        { aggregateId: 'agg2', store: 'store2', status: 'approuvée', products: [] }
      ]);

      const res = await request(app).get('/api/v1/suppliesQuery/supplies');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /supplies/:id', () => {
    it('devrait retourner la projection demandée', async () => {
      await SupplyProjection.create({
        aggregateId: 'agg3',
        store: 'store3',
        status: 'créée',
        products: [{ name: 'Produit X', quantity: 2 }]
      });

      const res = await request(app).get('/api/v1/suppliesQuery/supplies/agg3');

      expect(res.statusCode).toBe(200);
      expect(res.body.aggregateId).toBe('agg3');
      expect(res.body.products[0]).toMatchObject({ name: 'Produit X', quantity: 2 });
    });

    it('devrait retourner 404 si la projection est introuvable', async () => {
      const res = await request(app).get('/api/v1/suppliesQuery/supplies/inexistant');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Not found' });
    });
  });

  describe('POST /replay/:aggregateId', () => {
    it('devrait supprimer et reconstruire une projection depuis l’event store', async () => {
      // setup projection initiale
      await SupplyProjection.create({
        aggregateId: 'agg4',
        store: 'store-old',
        status: 'ancienne',
        products: [{ name: 'Ancien produit', quantity: 99 }]
      });

      // Mock réponse event store
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'agg4',
          store: 'store4',
          status: 'approuvée',
          products: [{ name: 'Produit Y', quantity: 10 }]
        })
      });

      const res = await request(app).post('/api/v1/suppliesQuery/replay/agg4');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Projection reconstruite pour agg4' });

      const updated = await SupplyProjection.findOne({ aggregateId: 'agg4' });
      expect(updated.store).toBe('store4');
      expect(updated.status).toBe('approuvée');
      expect(updated.products[0]).toMatchObject({ name: 'Produit Y', quantity: 10 });
    });

    it('devrait retourner une erreur si event store renvoie une erreur', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const res = await request(app).post('/api/v1/suppliesQuery/replay/introuvable');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: 'Erreur depuis event-store' });
    });

    it('devrait retourner 500 si une exception est levée', async () => {
      fetch.mockRejectedValueOnce(new Error('Erreur réseau'));

      const res = await request(app).post('/api/v1/suppliesQuery/replay/bug');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Erreur lors du replay' });
    });
  });
});
