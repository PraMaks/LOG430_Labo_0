const express = require('express');
const {
  login,
  authenticate,
  logout,
} = require('../controllers/authController');

const router = express.Router();
/**
 * @swagger
 * /login/login:
 *   post:
 *     summary: Connexion de l’utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/users/login', login);
router.delete('/users/logout', authenticate, logout);

module.exports = router;
