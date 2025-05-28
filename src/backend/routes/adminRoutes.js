const express = require('express');
const router = express.Router();

router.get('/report', (req, res) => {
    res.send('Hello Report!');
});

module.exports = router;