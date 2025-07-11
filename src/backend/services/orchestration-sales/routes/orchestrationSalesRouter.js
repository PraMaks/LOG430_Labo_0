const express = require('express');
const router = express.Router();
const orchestrationSalesController = require('../controllers/orchestrationSalesController');
const { authenticate } = require('../utils/authenticate');


/**
 * @swagger
 * tags:
 *   name: Orchestration-Sales
 *   description: Orchestration pour la gestion des commandes
 */

/**
 * @swagger
 * /api/v1/sales/stores/{storeNumber}:
 *   post:
 *     tags:
 *       - Sales
 *     summary: Enregistrer une nouvelle vente dans un magasin
 *     description: Enregistre une vente en décrémentant les stocks correspondants et en sauvegardant la vente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin (1 à 5) ou 'Central'
 *         schema:
 *           type: string
 *           example: "3"
 *     requestBody:
 *       description: Liste des produits vendus avec quantité et prix total
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - name
 *                 - qty
 *                 - total_price
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Banane"
 *                 qty:
 *                   type: integer
 *                   example: 3
 *                 total_price:
 *                   type: number
 *                   example: 6
 *     responses:
 *       201:
 *         description: Vente enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vente enregistrée avec succès."
 *       400:
 *         description: Requête invalide (magasin non valide ou stock insuffisant)
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
 *                   example: "Numéro de magasin invalide (1-5) ou 'Central'"
 *                 path:
 *                   type: string
 *                   example: "/api/v1/sales/stores/3"
 *       404:
 *         description: Magasin ou produit introuvable
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
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Produit 'Banane' introuvable dans le magasin '3'"
 *                 path:
 *                   type: string
 *                   example: "/api/v1/sales/stores/3/Banane"
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
 *                   example: "/api/v1/sales/stores/3/Banane"
 */
router.post('/stores/:storeNumber/:user', authenticate, orchestrationSalesController.postNewSaleEvent);

module.exports = router;
