const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const { authenticate } = require('../utils/authenticate');

/**
 * @swagger
 * tags:
 *   name: Stocks
 *   description: Endpoints réservés pour les stocks des magasins
 */

/**
 * @swagger
 * /api/v1/stocks/storesAll:
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
router.get('/storesAll', authenticate, stocksController.getStores);

/**
 * @swagger
 * /api/v1/stocks/storesAll/{productName}:
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
router.put('/storesAll/:productName', authenticate, stocksController.updateProductInfo);

/**
 * @swagger
 * /api/v1/stocks/stores/{storeNumber}/{productName}:
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
router.get('/stores/:storeNumber/:productName', authenticate, stocksController.getProductByStoreByName);

/**
 * @swagger
 * /api/v1/stocks/stores/warehouse:
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
router.get('/stores/warehouse', authenticate, stocksController.getProductsFromWarehouse);

/**
 * @swagger
 * /api/v1/stocks/stores/{storeNumber}:
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
router.get('/stores/:storeNumber', authenticate, stocksController.getProductsByStore);

module.exports = router;
