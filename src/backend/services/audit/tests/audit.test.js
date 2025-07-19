const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const EventLog = require('../models/EventLog');
const auditRouter = require('../routes/auditRouter');

// Création de l'app Express pour le test
const app = express();
app.use(express.json());
app.use('/api/v1/audit', auditRouter);

describe('GET /api/v1/audit/logs', () => {

  beforeEach(async () => {
    await EventLog.deleteMany({});
  });

  it('devrait retourner un tableau vide si aucun log', async () => {
    const res = await request(app).get('/api/v1/audit/logs');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('devrait retourner les logs triés par date de création (desc)', async () => {
    const log1 = await EventLog.create({
      eventId: '1',
      type: 'CREATED',
      timestamp: new Date().toISOString(),
      aggregateId: 'agg-1',
      data: { foo: 'bar' },
    });

    const log2 = await EventLog.create({
      eventId: '2',
      type: 'UPDATED',
      timestamp: new Date().toISOString(),
      aggregateId: 'agg-2',
      data: { foo: 'baz' },
    });

    const res = await request(app).get('/api/v1/audit/logs');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].eventId).toBe(log2.eventId); // plus récent d'abord
    expect(res.body[1].eventId).toBe(log1.eventId);
  });

  it('devrait retourner une erreur 500 si une exception est levée', async () => {
    // Mock de EventLog.find pour simuler une erreur
    jest.spyOn(EventLog, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/v1/audit/logs');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');

    // Restaure la méthode originale
    EventLog.find.mockRestore();
  });

});
