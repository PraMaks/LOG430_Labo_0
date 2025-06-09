const express = require('express');
const router = express.Router();
const standardController = require('../controllers/standardController');
const { authenticate } = require('../controllers/authController');


/**
 * @swagger
 * tags:
 *   name: Standard
 *   description: Endpoints pour la gestion sans avoir besoin d'accès administratifs'
 */

/**
 * @swagger
 * /api/v1/standard/stores/{storeNumber}/stock/{productName}:
 *   get:
 *     tags:
 *       - Standard
 *     summary: Obtenir un produit spécifique d’un magasin
 *     description: Retourne les informations d’un produit spécifique pour un magasin donné.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin (ou 'Central' pour l'entrepôt)
 *         schema:
 *           type: string
 *           example: "1"
 *       - name: productName
 *         in: path
 *         required: true
 *         description: Nom du produit
 *         schema:
 *           type: string
 *           example: "Pain"
 *     responses:
 *       200:
 *         description: Détails du produit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 qty:
 *                   type: integer
 *                 max_qty:
 *                   type: integer
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stores/:storeNumber/stock/:productName', authenticate, standardController.getProductByStoreByName);

/**
 * @swagger
 * /api/v1/standard/stores/warehouse/stock:
 *   get:
 *     tags:
 *       - Standard
 *     summary: Obtenir les produits de l'entrepôt central
 *     description: Retourne la liste complète des produits stockés dans l’entrepôt central.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   qty:
 *                     type: integer
 *                   max_qty:
 *                     type: integer
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stores/warehouse/stock', authenticate, standardController.getProductsFromWarehouse);

/**
 * @swagger
 * /api/v1/standard/stores/{storeNumber}/stock:
 *   get:
 *     tags:
 *       - Standard
 *     summary: Obtenir les produits d’un magasin
 *     description: Retourne tous les produits disponibles dans l’inventaire d’un magasin spécifique.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin
 *         schema:
 *           type: string
 *           example: "2"
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   qty:
 *                     type: integer
 *                   max_qty:
 *                     type: integer
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/stores/:storeNumber/stock', authenticate, standardController.getProductsByStore);

/**
 * @swagger
 * /api/v1/standard/stores/{storeNumber}/sales:
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
router.post('/stores/:storeNumber/sales', authenticate, standardController.postNewSaleInStore);

/**
 * @swagger
 * /api/v1/standard/stores/{storeNumber}/sales:
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
router.get('/stores/:storeNumber/sales', authenticate, standardController.getSalesByStore);

/**
 * @swagger
 * /api/v1/stores/{storeNumber}/sales/{saleId}:
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
router.delete('/stores/:storeNumber/sales/:saleId', authenticate, standardController.deleteSaleByStore);

/**
 * @swagger
 * /api/v1/standard/stores/{storeNumber}/supplies:
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
router.post('/stores/:storeNumber/supplies', authenticate, standardController.postNewSupplyRequestFromStore)

module.exports = router;
