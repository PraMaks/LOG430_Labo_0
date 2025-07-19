const mongoose = require('mongoose');

const supplyEventSchema = new mongoose.Schema({
  eventId: String,
  type: String, 
  timestamp: String,
  aggregateId: String, 
  store: String,
  products: [ 
    {
      name: String,
      quantity: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('SupplyEvent', supplyEventSchema);