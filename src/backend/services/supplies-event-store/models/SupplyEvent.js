const mongoose = require('mongoose');

const supplyEventSchema = new mongoose.Schema({
  eventId: String,
  type: String, // ex: DemandeCreee, DemandeApprouvee, DemandeLivre
  timestamp: String,
  aggregateId: String, // l’ID logique de la demande (business)
  store: String,
  products: [ // tu peux adapter selon ton format
    {
      name: String,
      quantity: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('SupplyEvent', supplyEventSchema);