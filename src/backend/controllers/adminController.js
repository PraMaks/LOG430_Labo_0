const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');

exports.getStores = async (req, res) => { 
  try {
    const rawStores = await Store.find();

    // On filtre les données JSON
    const stores = rawStores.map(store => ({
        name: store.name,
        address: store.address,
        nb_requests: store.nb_requests,
        is_store: store.is_store,
    }));
    res.json(stores);

  } catch (err) {
    console.error(err);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/admin/stores/all`
      }
    );
  }
};

exports.updateProductInfo = async (req, res) => {
  const productName = req.params.productName;
  const { name, description, price } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;

  try {
    const result = await StoreInventory.updateMany(
      { name: productName },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: "Not Found",
          message: `Aucun produit trouvé avec ce nom`,
          path: `/api/v1/admin/stores/all/stock/${productName}`
        }
      );
    }

    res.status(200).json({
      message: `Produit '${productName}' mis à jour dans ${result.modifiedCount} magasin(s)`,
      result,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit dans tous les magasins:', error);
    res.status(500).json(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error",
        message: "Erreur de communication avec le serveur",
        path: `/api/v1/admin/stores/all/stock/${productName}`
      }
    );
  }
};


