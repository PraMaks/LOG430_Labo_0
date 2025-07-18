const express = require('express');
const router = express.Router();
const suppliesEventController = require('../controllers/suppliesEventController');

router.get('/state/:aggregateId', suppliesEventController.getStateForAggregate);

module.exports = router;
