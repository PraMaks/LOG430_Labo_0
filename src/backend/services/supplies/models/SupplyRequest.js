const mongoose = require('mongoose');

const productRequestedSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true }
}, { _id: false });

const supplyRequestSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    products: { type: [productRequestedSchema], required: true },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    request_date: { type: Date, default: () => new Date() }
}, {
    collection: 'demandesApprovisionnement'
});

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema);
