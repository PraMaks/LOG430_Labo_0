const client = require('prom-client');

// Histogramme pour la durée des sagas
const sagaDuration = new client.Histogram({
  name: 'orchestration_saga_duration_seconds',
  help: 'Durée totale de la saga d’orchestration en secondes',
  labelNames: ['store', 'user', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Compteur des échecs
const sagaFailures = new client.Counter({
  name: 'orchestration_saga_failures_total',
  help: 'Nombre total d’échecs dans les sagas',
  labelNames: ['step', 'store', 'user'],
});

// Compteur des étapes atteintes
const sagaStepReached = new client.Counter({
  name: 'orchestration_saga_step_reached_total',
  help: 'Nombre d’étapes atteintes dans les sagas',
  labelNames: ['step', 'store', 'user'],
});

module.exports = {
  sagaDuration,
  sagaFailures,
  sagaStepReached,
};