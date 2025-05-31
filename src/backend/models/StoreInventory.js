const mongoose = require('mongoose');

const storeInventorySchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true},
    price: { type: Number, required: true },
    qty: { type: Number, required: true }
}, {
    collection: 'magasinInventaire' 
});

module.exports = mongoose.model('StoreInventory', storeInventorySchema);
