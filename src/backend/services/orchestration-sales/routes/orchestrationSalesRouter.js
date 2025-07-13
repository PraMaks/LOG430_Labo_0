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
 * /api/v1/orchestr-sales/stores/{storeNumber}/{user}:
 *   post:
 *     tags:
 *       - Orchestration-Sales
 *     summary: Orchestration complète d'une commande client
 *     description: |
 *       Lance une saga de vente complète : récupération du panier, enregistrement de la vente, mise à jour de l'inventaire, et promotion du rang utilisateur.  
 *       La vente est automatiquement annulée en cas d'échec à une étape.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeNumber
 *         required: true
 *         description: Numéro de magasin (1 à 5) ou nom logique ('Central', 'StockCentral')
 *         schema:
 *           type: string
 *           example: "StockCentral"
 *       - in: path
 *         name: user
 *         required: true
 *         description: Nom d'utilisateur du client
 *         schema:
 *           type: string
 *           example: "alice"
 *     responses:
 *       201:
 *         description: Commande enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vente enregistrée avec succès."
 *       400:
 *         description: Paramètre de magasin invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 *       401:
 *         description: Échec à une des étapes de la commande (panier, vente, inventaire, promotion)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur survenue lors de l'ÉTAPE 2"
 *       500:
 *         description: Erreur interne lors de la saga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 */
router.post('/stores/:storeNumber/:user', authenticate, orchestrationSalesController.postNewSaleEvent);

module.exports = router;
