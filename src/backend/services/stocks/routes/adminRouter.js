const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Administration
 *   description: Endpoints réservés aux administrateurs (magasin mère)
 */

/**
 * @swagger
 * /api/v1/admin/stores/all:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Récupérer la liste de tous les magasins
 *     description: Retourne une liste contenant les informations de tous les magasins (nom, adresse, nb_requests, is_store).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des magasins récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   nb_requests:
 *                     type: integer
 *                   is_store:
 *                     type: boolean
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stores/all', authenticate, adminController.getStores);

/**
 * @swagger
 * /api/v1/admin/stores/all/stock/{productName}:
 *   put:
 *     tags:
 *       - Administration
 *     summary: Mettre à jour les informations d’un produit dans tous les magasins
 *     description: Met à jour le nom, la description et/ou le prix d’un produit dans tous les inventaires.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productName
 *         in: path
 *         required: true
 *         description: Nom actuel du produit à mettre à jour
 *         schema:
 *           type: string
 *           example: "banane"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Banane bio"
 *               description:
 *                 type: string
 *                 example: "Banane Jaune"
 *               price:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.put('/stores/all/stock/:productName', authenticate, adminController.updateProductInfo);

module.exports = router;