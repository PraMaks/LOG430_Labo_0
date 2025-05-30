const mongoose = require('mongoose');

const productSoldSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total_price: { type: Number, required: true }
}, { _id: false }); 

const storeSaleSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    date: { type: Date, default: () => new Date() },
    total_price: { type: Number, required: true },
    contents: { type: [productSoldSchema], required: true }
}, {
    collection: 'magasinVentes'
});

module.exports = mongoose.model('StoreSale', storeSaleSchema);
