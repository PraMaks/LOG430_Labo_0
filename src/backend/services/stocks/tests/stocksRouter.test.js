const request = require('supertest');
const express = require('express');
const stocksRouter = require('../routes/stocksRouter');
const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');

const redisClient = require('../utils/redisClient');


const app = express();
app.use(express.json());
app.use('/api/v1/stocks', stocksRouter);

describe('Stocks Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();

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

    product = await StoreInventory.create({
      store: store._id,
      name: 'pomme',
      description: 'fruit rouge',
      price: 2,
      qty: 10,
      max_qty: 100,
    });

    product_warehouse = await StoreInventory.create({
      store: warehouse._id,
      name: 'pomme',
      description: 'fruit rouge',
      price: 2,
      qty: 10,
      max_qty: 100,
    });
  });
  

  describe('GET /api/v1/stocks/stores/warehouse', () => {
    it('devrait retourner les infos du produit', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .get(`/api/v1/stocks/stores/warehouse`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/stocks/storesAll', () => {
    it('devrait retourner tous les magasins', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .get(`/api/v1/stocks/storesAll`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /stores/:storeNumber/:productName', () => {
    it('devrait retourner les infos du produit', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .get(`/api/v1/stocks/stores/1/pomme`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('pomme');
      expect(response.body.qty).toBe(10);
    });

    it('devrait retourner 404 si le produit est introuvable', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .get(`/api/v1/stocks/stores/1/inexistant`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /stores/:storeNumber/stock', () => {
    it('devrait retourner les infos du produit', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .get(`/api/v1/stocks/stores/1`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT /stocks/storesAll/:productName', () => {
    it('devrait mettre à jour le produit et retourner 200', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .put('/api/v1/stocks/storesAll/pomme')
        .set('Authorization', token)
        .send({
          name: 'banane bio',
          description: 'bio et jaune',
          price: 1.5,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toMatch("Produit 'pomme' mis à jour dans 2 magasin(s)");
    });

    it('devrait retourner 404 si le produit n’existe pas', async () => {
      const token = 'token-admin-1751734873902'
      const response = await request(app)
        .put('/api/v1/stocks/storesAll/nonexistant')
        .set('Authorization', token)
        .send({
          name: 'nouveau',
          description: 'description',
          price: 9.99,
        });

      expect(response.statusCode).toBe(404);
    });
  });

});