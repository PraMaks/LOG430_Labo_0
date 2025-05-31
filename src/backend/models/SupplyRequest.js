const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    products: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true }
        }
    ],
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'fulfilled'], default: 'pending' },
    requestDate: { type: Date, default: Date.now },
}, {
    collection: 'demandesApprovisionnement'
});

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema);
