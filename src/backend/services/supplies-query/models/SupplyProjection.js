const mongoose = require('mongoose');

const projectionSchema = new mongoose.Schema({
  aggregateId: { type: String, unique: true },
  store: String,
  status: String,
  products: [
    {
      name: String,
      quantity: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('SupplyProjection', projectionSchema);