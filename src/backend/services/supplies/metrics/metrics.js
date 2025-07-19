const client = require('prom-client');

const register = client.register;

// Compteur d’événements émis
const eventsPublishedCounter = new client.Counter({
  name: 'supplies_events_published_total',
  help: 'Nombre total d\'événements publiés',
  labelNames: ['event_type']
});

module.exports = {
  register,
  eventsPublishedCounter,
};