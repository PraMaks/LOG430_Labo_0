const EventLog = require('../models/EventLog');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await EventLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
  }
};