const Store = require('./models/Store');
const logger = require('./utils/logger');

const DEFAULT_STORES = [
  { name: 'Magasin 1', address: '123 rue Principale', nb_requests: 0, is_store: true },
  { name: 'Magasin 2', address: '456 avenue du Centre', nb_requests: 0, is_store: true },
  { name: 'Magasin 3', address: '789 boulevard Nord', nb_requests: 0, is_store: true },
  { name: 'Magasin 4', address: '321 chemin Sud', nb_requests: 0, is_store: true },
  { name: 'Magasin 5', address: '654 route Est', nb_requests: 0, is_store: true },
  { name: 'Magasin Central', address: '146 route Centrale', nb_requests: 0, is_store: true },
  { name: 'Stock Central', address: '257 route Centrale', nb_requests: 0, is_store: false }
];

async function initDb() {
  logger.info('Initialisation de la base de données...');
  let counter = 1;
  let centralStock = null;

  const storesByName = {}; // Pour associer facilement les magasins

  // Création des magasins
  for (const storeData of DEFAULT_STORES) {
    let store = await Store.findOne({ name: storeData.name });
    if (!store) {
      store = new Store(storeData);
      await store.save();
      logger.info(`'${store.name}' créé.`);
    } else {
      logger.info(`'${store.name}' déjà existant.`);
    }

    storesByName[store.name] = store;

    if (store.name === 'Stock Central') {
      centralStock = store;
      continue;
    }

    counter++;
  }

  logger.info('Initialisation terminée.');
}

module.exports = initDb;
