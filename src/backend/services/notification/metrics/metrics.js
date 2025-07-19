const client = require('prom-client');

// Enregistrement global
const register = client.register;

// 1. Compteur d’événements consommés
const eventsConsumedCounter = new client.Counter({
  name: 'events_consumed_total',
  help: 'Nombre total d\'événements consommés',
  labelNames: ['event_type']
});

// 2. Histogramme pour mesurer la latence émission → consommation
const eventLatencyHistogram = new client.Histogram({
  name: 'event_latency_seconds',
  help: 'Latence des événements entre émission et consommation',
  labelNames: ['event_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

module.exports = {
  register,
  eventsConsumedCounter,
  eventLatencyHistogram,
};