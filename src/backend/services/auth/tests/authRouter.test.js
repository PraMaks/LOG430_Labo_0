const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const authRouter = require('../routes/authRouter');
const User = require('../models/User');

const redisClient = require('../utils/redisClient');

// Mock du modèle User
jest.mock('../models/User');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('Auth Router', () => {
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
      const token = 'token-admin-1751734873902'; // fictif

      const response = await request(app)
          .delete('/api/v1/auth/users/logout')
          .set('Authorization', token);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Déconnexion réussie');
    });

    it('devrait retourner 400 si token invalide', async () => {
        const response = await request(app)
            .delete('/api/v1/auth/users/logout')
            .set('Authorization', 'token-invalide');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch("Token invalide");
    });
  });
});

describe('POST /users/register', () => {
  it("devrait créer un nouvel utilisateur s'il n'existe pas", async () => {
    const newUser = {
      username: 'nouvel_user',
      password: 'motdepasse123',
    };

    // Mock: l'utilisateur n'existe pas
    User.findOne.mockResolvedValue(null);

    // Mock de `save` sur l'instance de User
    const saveMock = jest.fn().mockResolvedValue(undefined);
    User.mockImplementation(() => ({ ...newUser, save: saveMock }));

    const response = await request(app)
      .post('/api/v1/auth/users/register')
      .send(newUser);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Utilisateur créé avec succès.");
    expect(saveMock).toHaveBeenCalled();
  });

  it("devrait retourner 400 si l'utilisateur existe déjà", async () => {
    const existingUser = {
      username: 'existant',
      password: 'secret',
    };

    User.findOne.mockResolvedValue(existingUser);

    const response = await request(app)
      .post('/api/v1/auth/users/register')
      .send(existingUser);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/existant/i);
  });

  it("devrait retourner 500 en cas d'erreur serveur", async () => {
    User.findOne.mockRejectedValue(new Error('Boum!'));

    const response = await request(app)
      .post('/api/v1/auth/users/register')
      .send({ username: 'test', password: 'x' });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toMatch(/erreur de communication/i);
  });
});