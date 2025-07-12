const mongoose = require('mongoose');

const eventSaleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, default: () => new Date() },
    type: { 
        type: String, 
        enum: ['PanierRecup', 'CommandeEnregistree', 'InventaireMAJ', 'CommandeConfirmee', 'CommandeAnnulee'] 
    },
    details: { type: String, required: true}
}, {
    collection: 'eventVentes'
});

module.exports = mongoose.model('EventSale', eventSaleSchema);
