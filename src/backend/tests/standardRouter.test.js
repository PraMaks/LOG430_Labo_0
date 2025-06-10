const request = require('supertest');
const { app } = require('../app');
const { tokenStore } = require('../controllers/authController');
const User = require('../models/User');
const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');
const StoreSale = require('../models/StoreSale');
const SupplyRequest = require('../models/SupplyRequest');
const bcrypt = require('bcrypt');

describe('Standard Router', () => {
  let token;
  let storeUser;
  let store;
  let product;

  beforeAll(async () => {
    // Créer un utilisateur magasin
    storeUser = new User({
      username: 'store1',
      password: await bcrypt.hash('storepass', 10),
      is_store: true,
    });
    await storeUser.save();

    token = `token-${storeUser.username}-test`;
    tokenStore.set(token, storeUser);

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

  describe('GET /stores/:storeNumber/stock/:productName', () => {
    it('devrait retourner les infos du produit', async () => {
      const response = await request(app)
        .get(`/api/v1/standard/stores/1/stock/pomme`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe('pomme');
      expect(response.body.qty).toBe(10);
    });

    it('devrait retourner 404 si le produit est introuvable', async () => {
      const response = await request(app)
        .get(`/api/v1/standard/stores/1/stock/inexistant`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /stores/warehouse/stock', () => {
    it('devrait retourner les infos du produit', async () => {
      const response = await request(app)
        .get(`/api/v1/standard/stores/warehouse/stock`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /stores/:storeNumber/stock', () => {
    it('devrait retourner les infos du produit', async () => {
      const response = await request(app)
        .get(`/api/v1/standard/stores/1/stock`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('DELETE /stores/:storeNumber/sales/:saleId', () => {
    let sale;

    beforeAll(async () => {
      sale = await StoreSale.create({
        store: store._id,
        product: product._id,
        qty: 1,
        total_price: 2,
        date: new Date(),
      });

      // simule réduction de stock
      product.qty -= 1;
      await product.save();
    });

    it('devrait annuler la vente et rétablir le stock', async () => {
      const response = await request(app)
        .delete(`/api/v1/standard/stores/1/sales/${sale._id}`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);

      const updatedProduct = await StoreInventory.findById(product._id);
      expect(updatedProduct.qty).toBe(product.qty);
    });

    it('devrait retourner 404 si la vente est introuvable', async () => {
      const response = await request(app)
        .delete(`/api/v1/standard/stores/1/sales/507f1f77bcf86cd799439011`)
        .set('Authorization', token);

      expect(response.statusCode).toBe(404);
    });
  });

});
