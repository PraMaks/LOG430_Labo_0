const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticate } = require('../utils/authenticate');


/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Endpoints pour la gestion des ventes'
 */

/**
 * @swagger
 * /api/v1/sales/stores/{storeNumber}:
 *   post:
 *     tags:
 *       - Standard
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
 *                   example: "/api/v1/standard/stores/3/sales"
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
 *                   example: "/api/v1/standard/stores/3/stock/Banane"
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
 *                   example: "/api/v1/standard/stores/3/stock/Banane"
 */
router.post('/stores/:storeNumber', authenticate, salesController.postNewSaleInStore);

/**
 * @swagger
 * /api/v1/sales/stores/{storeNumber}:
 *   get:
 *     tags:
 *       - Standard
 *     summary: Obtenir les ventes d’un magasin
 *     description: Retourne la liste des ventes réalisées par un magasin spécifique.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin
 *         schema:
 *           type: string
 *           example: "3"
 *     responses:
 *       200:
 *         description: Liste des ventes du magasin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productName:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   totalPrice:
 *                     type: number
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stores/:storeNumber', authenticate, salesController.getSalesByStore);

/**
 * @swagger
 * /api/v1/sales/stores/{storeNumber}/{saleId}:
 *   delete:
 *     tags:
 *       - Standard
 *     summary: Supprimer une vente dans un magasin et remettre les produits en stock
 *     description: Supprime une vente identifiée par saleId dans un magasin donné, et remet les quantités vendues dans l'inventaire.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin (1 à 5) ou 'Central'
 *         schema:
 *           type: string
 *           example: "2"
 *       - name: saleId
 *         in: path
 *         required: true
 *         description: Identifiant unique de la vente à supprimer
 *         schema:
 *           type: string
 *           example: "642d9b1f4f1a4b1234567890"
 *     responses:
 *       200:
 *         description: Vente supprimée et stock mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vente supprimée et stock mis à jour."
 *       400:
 *         description: Requête invalide (magasin non valide)
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
 *                   example: "/api/v1/standard/stores/2/sales/642d9b1f4f1a4b1234567890"
 *       404:
 *         description: Magasin ou vente introuvable
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
 *                   example: "Vente introuvable dans ce magasin."
 *                 path:
 *                   type: string
 *                   example: "/api/v1/standard/stores/2/sales/642d9b1f4f1a4b1234567890"
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
 *                   example: "/api/v1/standard/stores/2/sales/642d9b1f4f1a4b1234567890"
 */
router.delete('/stores/:storeNumber/:saleId', authenticate, salesController.deleteSaleByStore);

module.exports = router;
