const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  eventId: String,
  type: String,
  timestamp: String,
  aggregateId: String,
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('EventLog', eventLogSchema);