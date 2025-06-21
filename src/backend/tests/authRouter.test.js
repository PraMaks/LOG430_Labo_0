const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const authRouter = require('../routes/authRouter');
const User = require('../models/User');

jest.mock('redis', () => require('redis-mock'));
const redisClient = require('../utils/redisClient');
if (!redisClient.keys) {
  redisClient.keys = async (pattern) => {
    const store = redisClient.data || redisClient.storage || {};
    // On ne filtre pas le pattern ici, retourne juste toutes les clés
    return Object.keys(store);
  };
}
if (!redisClient.get) {
  redisClient.get = async (key) => {
    const store = redisClient.data || redisClient.storage || {};
    return store[key] || null;
  };
}

if (!redisClient.set) {
  redisClient.set = async (key, value) => {
    if (!redisClient.data && !redisClient.storage) {
      redisClient.data = {};
    }
    (redisClient.data || redisClient.storage)[key] = value;
    return 'OK';
  };
}

if (!redisClient.del) {
  redisClient.del = async (key) => {
    if (!redisClient.data && !redisClient.storage) {
      redisClient.data = {};
    }
    delete (redisClient.data || redisClient.storage)[key];
    return 1; // renvoyer 1 pour dire qu'une clé a été supprimée
  };
}
// Mock du modèle User
jest.mock('../models/User');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('Auth Router', () => {
  beforeEach(async () => {
    const keys = await redisClient.keys('*');
    
      await redisClient.del(keys);
    
    jest.clearAllMocks();
  });

  describe('POST /users/login', () => {
    it('devrait retourner 200 avec un token valide', async () => {
        const mockUser = {
        username: 'alice',
        password: await bcrypt.hash('secret123', 10),
        is_admin: false,
        stores: [{ name: 'Magasin A' }],
        };

        User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
        });

        const response = await request(app)
        .post('/api/v1/auth/users/login')
        .send({ username: 'alice', password: 'secret123' });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.username).toBe('alice');
        expect(response.body.stores).toEqual(['Magasin A']);
    });

    it('devrait retourner 401 si utilisateur non trouvé', async () => {
        User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
        });

        const response = await request(app)
        .post('/api/v1/auth/users/login')
        .send({ username: 'notfound', password: 'xxx' });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toMatch(/invalide/i);
    });

    it('devrait retourner 401 si mot de passe incorrect', async () => {
        const hashedPassword = await bcrypt.hash('correct', 10);
        const mockUser = {
        username: 'bob',
        password: hashedPassword,
        is_admin: false,
        stores: [],
        };

        User.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser),
        });

        const response = await request(app)
        .post('/api/v1/auth/users/login')
        .send({ username: 'bob', password: 'wrong' });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toMatch(/invalide/i);
    });
  });

  describe('DELETE /users/logout', () => {
    /*it('devrait retourner 200 si token valide', async () => {
      const token = 'token-alice-123';
      await redisClient.set(token, JSON.stringify({ username: 'alice' }));

      const response = await request(app)
        .delete('/api/v1/auth/users/logout')
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Déconnexion réussie');
    });*/

    it('devrait retourner 403 si token invalide', async () => {
        const response = await request(app)
            .delete('/api/v1/auth/users/logout')
            .set('Authorization', 'token-invalide');

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toMatch("Token invalide ou expiré");
    });
  });

  afterAll(async () => {
    await redisClient.quit(); // Nettoyage Redis mock
  });
});
