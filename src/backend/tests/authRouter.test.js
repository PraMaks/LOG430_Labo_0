const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const authRouter = require('../routes/authRouter');
const User = require('../models/User');
const { tokenStore } = require('../controllers/authController');

// Mock du modèle User
jest.mock('../models/User');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('Auth Router', () => {
  beforeEach(() => {
    tokenStore.clear();
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
    it('devrait retourner 200 si token valide', async () => {
      const token = 'token-alice-123';
      tokenStore.set(token, { username: 'alice' });

      const response = await request(app)
        .delete('/api/v1/auth/users/logout')
        .set('Authorization', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Déconnexion réussie');
    });

    it('devrait retourner 403 si token invalide', async () => {
        const response = await request(app)
            .delete('/api/v1/auth/users/logout')
            .set('Authorization', 'token-invalide');

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toMatch(/Token invalide ou manquant/);
    });
  });
});
