const SupplyEvent = require('../models/SupplyEvent');

exports.getStateForAggregate = async (req, res) => {
  const id = req.params.aggregateId;

  try {
    const events = await SupplyEvent.find({ aggregateId: id }).sort({ timestamp: 1 });

    const state = { id, status: null, products: [], store: null };

    for (const evt of events) {
      switch (evt.type) {
        case 'DemandeReapprovisionnementCreee':
          state.status = 'créée';
          state.products = evt.products;
          state.store = evt.store;
          break;
        case 'DemandeApprouvee':
          state.status = 'approuvée';
          break;
        case 'DemandeAnnulee':
          state.status = 'annulée';
          break;
        default:
          break;
      }
    }

    res.json(state);
  } catch (err) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      error: "Internal Server Error",
      message: "Erreur de communication avec le serveur",
      path: "/api/v1/suppliesState/state/:aggregateId"
    });
  }
};