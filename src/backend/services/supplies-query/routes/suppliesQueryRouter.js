const express = require('express');
const router = express.Router();
const suppliesQueryController = require('../controllers/suppliesQueryController');

router.get('/supplies', suppliesQueryController.getAll);
router.get('/supplies/:id', suppliesQueryController.getByAggregateId);

router.post('/replay/:aggregateId', suppliesQueryController.replayOneFromEventStore);

module.exports = router;