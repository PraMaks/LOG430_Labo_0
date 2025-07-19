const EventLog = require('../models/EventLog');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await EventLog.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur de communication avec le serveur",
      path: "/api/v1/audit/logs"
    });
  }
};