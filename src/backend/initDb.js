const Store = require('./models/Store');
const StoreInventory = require('./models/StoreInventory');

const DEFAULT_STORES = [
  { name: 'Magasin 1', address: '123 rue Principale', nb_requests: 0 },
  { name: 'Magasin 2', address: '456 avenue du Centre', nb_requests: 0 },
  { name: 'Magasin 3', address: '789 boulevard Nord', nb_requests: 0 },
  { name: 'Magasin 4', address: '321 chemin Sud', nb_requests: 0 },
  { name: 'Magasin 5', address: '654 route Est', nb_requests: 0 },
  { name: 'Magasin Central', address: '146 route Centrale', nb_requests: 0 },
];

const DEFAULT_PRODUCTS = [
  { name: 'Bread', description: 'Very Tasty Bread', price: 4, qty: 5, max_qty: 5},
  { name: 'Soda', description: 'Very Refreshing', price: 3, qty: 10, max_qty: 10},
  { name: 'Candy', description: 'Very Sugary', price: 2, qty: 15, max_qty: 15 },
];

async function initDb() {
  console.log('Initialisation de la base de données...');
  let counter = 1;
  let centralStore = null;

  for (const storeData of DEFAULT_STORES) {
    let store = await Store.findOne({ name: storeData.name });
    if (!store) {
      store = new Store(storeData);
      await store.save();
      console.log(`Magasin '${store.name}' créé.`);
    } else {
      console.log(`Magasin '${store.name}' déjà existant.`);
    }

    if (store.name === 'Magasin Central') {
      centralStore = store; // On le sauve pour le trouver plus tard
      continue; 
    }

    for (const product of DEFAULT_PRODUCTS) {
      const productName = product.name + counter;
      const exists = await StoreInventory.findOne({ store: store._id, name: productName });
      if (!exists) {
        const inventoryItem = new StoreInventory({
          store: store._id,
          name: productName,
          description: product.description,
          price: product.price,
          qty: product.qty,
          max_qty: product.max_qty
        });
        await inventoryItem.save();
        console.log(`Ajout de '${productName}' au magasin '${store.name}'`);
      } else {
        console.log(`Produit '${productName}' déjà présent dans le magasin '${store.name}'`);
      }
    }

    counter++;
  }

  if (centralStore) {
    const allOtherProducts = await StoreInventory.find({ store: { $ne: centralStore._id } });

    for (const product of allOtherProducts) {
      const alreadyExists = await StoreInventory.findOne({ store: centralStore._id, name: product.name });
      if (!alreadyExists) {
        const copiedProduct = new StoreInventory({
          store: centralStore._id,
          name: product.name,
          description: product.description,
          price: product.price,
          qty: product.qty*10,
          max_qty: product.max_qty*10
        });
        await copiedProduct.save();
        console.log(`Ajout de '${product.name}' dans 'Magasin Central'`);
      }
    }
  }
}

module.exports = initDb;
