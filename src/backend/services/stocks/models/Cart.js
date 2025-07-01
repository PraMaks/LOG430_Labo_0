const mongoose = require('mongoose');

const productCartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true},
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total_price: { type: Number, required: true }
}, { _id: false }); 

const cartSchema = new mongoose.Schema({
    user: { type: String, required: true },
    total_price: { type: Number, required: true },
    contents: { type: [productSoldSchema], required: true }
}, {
    collection: 'magasinPaniers'
});

module.exports = mongoose.model('Cart', productCartSchema);
