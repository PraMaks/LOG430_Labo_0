const express = require('express');
const {
  login,
  authenticate,
  logout,
  register,
  incrementUserRank,
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
 *                 type:
 *                   type: string
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


/**
 * @swagger
 * /api/v1/auth/users/register:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Enregistrement d’un nouvel utilisateur
 *     description: Crée un nouvel utilisateur s’il n’existe pas déjà.
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
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès."
 *       400:
 *         description: Utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Nom d'utilisateur déjà existant, choississez un autre"
 *                 path:
 *                   type: string
 *                   example: "/api/v1/auth/users/register"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "Erreur de communication avec le serveur"
 *                 path:
 *                   type: string
 *                   example: "/api/v1/auth/users/register"
 */
router.post('/users/register', register);

/**
 * @swagger
 * /api/v1/auth/users/{user}/rank:
 *   patch:
 *     tags:
 *       - Authentification
 *     summary: Incrémente le rang de l’utilisateur
 *     description: Incrémente la valeur `rank` de 1 pour un utilisateur donné.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: Nom d'utilisateur à mettre à jour
 *         schema:
 *           type: string
 *           example: "johndoe"
 *     responses:
 *       200:
 *         description: Rank incrémenté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur mis à jour avec succès."
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur 'johndoe' non trouvé pour l'incrémentation du rank."
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 message:
 *                   type: string
 *                   example: "Erreur de communication avec le serveur"
 *                 path:
 *                   type: string
 *                   example: "/api/v1/auth/users/johndoe/rank"
 */
router.patch('/users/:user/rank', authenticate, incrementUserRank);

module.exports = router;
