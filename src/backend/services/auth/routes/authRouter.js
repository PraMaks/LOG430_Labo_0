const express = require('express');
const {
  login,
  authenticate,
  logout,
} = require('../controllers/authController');

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Endpoints pour la gestion de l'authentification

 * /api/v1/auth/users/login:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Connexion de l’utilisateur
 *     description: Permet à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "alice"
 *               password:
 *                 type: string
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 username:
 *                   type: string
 *                 is_admin:
 *                   type: boolean
 *                 stores:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 */
router.post('/users/login', login);


/**
 * @swagger
 * /api/v1/auth/users/logout:
 *   delete:
 *     tags:
 *       - Authentification
 *     summary: Déconnexion de l’utilisateur
 *     description: Invalide le token d’un utilisateur connecté.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       400:
 *         description: Token invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 *       403:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 */
router.delete('/users/logout', authenticate, logout);

module.exports = router;
