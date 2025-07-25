const client = require('prom-client');

const register = client.register;

// Compteur d’événements émis
const eventsPublishedCounter = new client.Counter({
  name: 'supplies_events_published_total',
  help: 'Nombre total d\'événements publiés',
  labelNames: ['event_type']
});

const sagaStartedCounter = new client.Counter({
  name: 'saga_started_total',
  help: 'Nombre total de sagas démarrées',
  labelNames: ['saga_name']
});

const sagaSuccessCounter = new client.Counter({
  name: 'saga_success_total',
  help: 'Nombre total de sagas terminées avec succès',
  labelNames: ['saga_name']
});

const sagaFailureCounter = new client.Counter({
  name: 'saga_failure_total',
  help: 'Nombre total de sagas ayant échoué',
  labelNames: ['saga_name']
});

module.exports = {
  register,
  eventsPublishedCounter,
  sagaStartedCounter,
  sagaSuccessCounter,
  sagaFailureCounter,
};