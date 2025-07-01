const Store = require('./models/Store');
const User = require('./models/User');
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

const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123', type: 'admin' },
  { username: 'user1', password: 'password1', type: 'seller' },
  { username: 'user2', password: 'password2', type: 'seller' },
  { username: 'user3', password: 'password3', type: 'seller' },
  { username: 'user4', password: 'password4', type: 'seller' },
  { username: 'user5', password: 'password5', type: 'seller' }
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

  // Création des utilisateurs avec lien vers magasins
  const userStoreMap = {
    'admin': ['Magasin 1', 'Magasin 2', 'Magasin 3', 'Magasin 4', 'Magasin 5', 'Magasin Central'],
    'user1': ['Magasin 1'],
    'user2': ['Magasin 2'],
    'user3': ['Magasin 3'],
    'user4': ['Magasin 4'],
    'user5': ['Magasin 5']
  };

  for (const userData of DEFAULT_USERS) {
    let user = await User.findOne({ username: userData.username });

    const linkedStores = (userStoreMap[userData.username] || [])
      .map(name => storesByName[name]?._id)
      .filter(Boolean);

    if (!user) {
      user = new User({
        username: userData.username,
        password: userData.password,
        type: userData.type,
        stores: linkedStores
      });
      await user.save();
      logger.info(`Utilisateur '${user.username}' créé.`);
    } else {
      logger.info(`Utilisateur '${user.username}' déjà existant.`);
    }
  }

  logger.info('Initialisation terminée.');
}

module.exports = initDb;
