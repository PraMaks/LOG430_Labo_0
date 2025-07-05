global.fetch = jest.fn(); 
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const salesRouter = require('../routes/salesRouter');
const StoreSale = require('../models/StoreSale');
const Store = require('../models/Store');

const redisClient = require('../utils/redisClient');


const app = express();
app.use(express.json());
app.use('/api/v1/sales', salesRouter);

describe('Sales Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Stock updated' }),
    });

    jest.spyOn(redisClient, 'del').mockImplementation((token) => {
      if (token === 'token-admin-1751734873902') {
        return Promise.resolve(1); 
      } else {
        return Promise.resolve(0); 
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  let token;
  let storeUser;
  let store;
  let product;

  beforeAll(async () => {

    store = await Store.create({
      name: 'Magasin 1',
      address: '456 rue test',
      nb_requests: 0,
      is_store: true,
    });

    warehouse = await Store.create({
      name: 'Stock Central',
      address: '456 rue test',
      nb_requests: 0,
      is_store: false,
    });

  });

  describe('DELETE /api/v1/sales/stores/{storeNumber}/{saleId}', () => {
    let sale;

    beforeAll(async () => {
      sale = await StoreSale.create({
        store: store._id,
        total_price: 2,
        contents: [
          {
            name: "pomme",
            description: "test",
            qty: 1,
            price: 2,
            total_price: 2
          }
        ]
      });

    });

    it('devrait annuler la vente et rétablir le stock', async () => {
      const token = 'token-admin-1751734873902';
      
      const response = await request(app)
        .delete(`/api/v1/sales/stores/1/${sale._id}`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toMatch(/Vente supprimée/);

      // Vérifie que la vente est bien supprimée
      const deleted = await StoreSale.findById(sale._id);
      expect(deleted).toBeNull();

      // Vérifie que le fetch a bien été appelé avec les bons arguments
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/stores/1/false`),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': token,
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(sale.contents)
        })
      );
    });

    it('devrait retourner 404 si la vente est introuvable', async () => {
      const token = 'token-admin-1751734873902';
      const invalidId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/sales/stores/1/${invalidId}`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toMatch(/Vente introuvable/);
    });
  });


});