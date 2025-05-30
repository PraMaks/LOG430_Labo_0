const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true }
}, {
    collection: 'magasins'
});

module.exports = mongoose.model('Store', storeSchema);