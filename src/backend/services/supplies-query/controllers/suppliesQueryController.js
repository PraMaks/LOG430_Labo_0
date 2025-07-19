const SupplyProjection = require('../models/SupplyProjection');

exports.getAll = async (req, res) => {
  const result = await SupplyProjection.find();
  res.json(result);
};

exports.getByAggregateId = async (req, res) => {
  const doc = await SupplyProjection.findOne({ aggregateId: req.params.id });
  if (!doc) {
    return res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      message: "Projection pas trouvée",
      path: "/api/v1/suppliesQuery/supplies/:id"
    });
  }
  res.json(doc);
};

exports.replayOneFromEventStore = async (req, res) => {
  const id = req.params.aggregateId;

  try {
    // 1. Récupérer les événements de ce aggregateId depuis l’event-store
    const response = await fetch(`http://supplies-event-store:3045/api/v1/suppliesState/state/${id}`);
    if (!response.ok) {
      return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Bad Response",
      message: "Erreur côté event store",
      path: "/api/v1/suppliesQuery/replay/:aggregateId"
    });
    }

    const state = await response.json();

    // 2. Supprimer projection existante si elle existe
    await SupplyProjection.deleteOne({ aggregateId: id });

    // 3. Réinsérer la projection à jour
    await SupplyProjection.create({
      aggregateId: id,
      store: state.store,
      products: state.products,
      status: state.status
    });

    res.status(200).json({ message: `Projection reconstruite pour ${id}` });
  } catch (err) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur de communication avec le serveur",
      path: "/api/v1/suppliesQuery/replay/:aggregateId"
    });
  }
};