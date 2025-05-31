const Store = require('./models/Store');
const StoreInventory = require('./models/StoreInventory');

const DEFAULT_STORES = [
  { name: 'Magasin 1', address: '123 rue Principale' },
  { name: 'Magasin 2', address: '456 avenue du Centre' },
  { name: 'Magasin 3', address: '789 boulevard Nord' },
  { name: 'Magasin 4', address: '321 chemin Sud' },
  { name: 'Magasin 5', address: '654 route Est' },
];

const DEFAULT_PRODUCTS = [
  { name: 'Bread', description: 'Very Tasty Bread', price: 4, qty: 5 },
  { name: 'Soda', description: 'Very Refreshing', price: 3, qty: 10 },
  { name: 'Candy', description: 'Very Sugary', price: 2, qty: 15 },
];

async function initDb() {
  console.log('Initialisation de la base de données…');

  for (const storeData of DEFAULT_STORES) {
    let store = await Store.findOne({ name: storeData.name });
    if (!store) {
      store = new Store(storeData);
      await store.save();
      console.log(`Magasin '${store.name}' créé.`);
    } else {
      console.log(`Magasin '${store.name}' déjà existant.`);
    }

    for (const product of DEFAULT_PRODUCTS) {
      const exists = await StoreInventory.findOne({ store: store._id, name: product.name });
      if (!exists) {
        const inventoryItem = new StoreInventory({
          store: store._id,
          name: product.name,
          description: product.description,
          price: product.price,
          qty: product.qty,
        });
        await inventoryItem.save();
        console.log(`Ajout de '${product.name}' au magasin '${store.name}'`);
      } else {
        console.log(`Produit '${product.name}' déjà présent dans le magasin '${store.name}'`);
      }
    }
  }
}

module.exports = initDb;
