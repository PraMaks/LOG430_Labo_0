const express = require('express');
const router = express.Router();
const suppliesController = require('../controllers/suppliesController');
const { authenticate } = require('../utils/authentication');


/**
 * @swagger
 * tags:
 *   name: Supplies
 *   description: Endpoints pour la gestion des demandes de reapprovisionnement'
 */

/**
 * @swagger
 * /api/v1/supplies/stores/{storeNumber}:
 *   post:
 *     tags:
 *       - Standard
 *     summary: Faire une demande de réapprovisionnement
 *     description: Permet à un magasin d’envoyer une demande de réapprovisionnement pour un produit donné.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin qui fait la demande
 *         schema:
 *           type: string
 *           example: "2"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - quantity
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Lait"
 *               quantity:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Demande de réapprovisionnement envoyée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/stores/:storeNumber', authenticate, suppliesController.postNewSupplyRequestFromStore)

module.exports = router;
