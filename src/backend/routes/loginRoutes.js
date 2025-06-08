const express = require('express');
const {
  login,
  authenticate,
  logout,
} = require('../controllers/loginController');

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);

module.exports = router;
