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
 * tags:
 *   name: Panier
 *   description: Endpoints réservés pour la gestion du panier
 */

/**
 * @swagger
 * /api/v1/stocks/storesAll:
 *   get:
 *     tags:
 *       - Stocks
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
 *       - Stocks
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
 *       - Stocks
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
 *       - Stocks
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
 *       - Stocks
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

/**
 * @swagger
 * /api/v1/stocks/stores/{storeNumber}/supply:
 *   patch:
 *     tags:
 *       - Stocks
 *     summary: Incrémenter le nombre de demandes d’approvisionnement
 *     description: Incrémente le champ `nb_requests` d’un magasin donné, identifié par son numéro ou "Central".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin (1 à 5) ou "Central"
 *         schema:
 *           type: string
 *           example: "2"
 *     responses:
 *       200:
 *         description: Nombre de demandes mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                   example: "Magasin 2"
 *                 nb_requests:
 *                   type: integer
 *       400:
 *         description: Numéro de magasin invalide
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
 *                   example: "/api/v1/stocks/stores/invalid/supply"
 *       404:
 *         description: Magasin introuvable
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
 *                   example: "Magasin 'Magasin 99' introuvable"
 *                 path:
 *                   type: string
 *                   example: "/api/v1/stocks/stores/99/supply"
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
 *                   example: "/api/v1/stocks/stores/2/supply"
 */
router.patch('/stores/:storeNumber/supply', authenticate, stocksController.updateSupplyNbRequest);

/**
 * @swagger
 * /api/v1/stocks/stores/{storeNumber}/{isSale}:
 *   patch:
 *     tags:
 *       - Stocks
 *     summary: Met à jour les quantités de produits après une vente ou un réapprovisionnement
 *     description: |
 *       Met à jour les quantités de produits dans un magasin donné suite à une vente (`isSale=true`) ou un retour/approvisionnement (`isSale=false`).
 *       Le magasin peut être un numéro entre 1 et 5, "Central" ou "StockCentral".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeNumber
 *         in: path
 *         required: true
 *         description: Numéro du magasin (1 à 5), "Central" ou "StockCentral"
 *         schema:
 *           type: string
 *           example: "2"
 *       - name: isSale
 *         in: path
 *         required: true
 *         description: Indique s'il s'agit d'une vente (`true`) ou d'un approvisionnement (`false`)
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           example: "true"
 *     requestBody:
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
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Nom du produit
 *                   example: "Chaussure orthopédique"
 *                 qty:
 *                   type: integer
 *                   description: Quantité vendue ou reçue
 *                   example: 2
 *     responses:
 *       200:
 *         description: Produits mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   qty:
 *                     type: integer
 *       400:
 *         description: Requête invalide (stock insuffisant ou magasin invalide)
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
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Stock insuffisant pour 'Produit X'. Disponible : 3"
 *                 path:
 *                   type: string
 *       404:
 *         description: Magasin ou produit introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Produit 'X' introuvable dans le magasin 'Magasin 2'"
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
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
 *                   example: "/api/v1/stocks/stores/2/true"
 */
router.patch('/stores/:storeNumber/:isSale', authenticate, stocksController.updateProductsAfterSale);

/**
 * @swagger
 * /api/v1/stocks/{user}/cart:
 *   post:
 *     tags:
 *       - Panier
 *     summary: Met à jour le panier d’un utilisateur
 *     description: |
 *       Met à jour le panier du client identifié par son nom.  
 *       Si `replace` est vrai, le panier existant est remplacé.  
 *       Sinon, les produits sont ajoutés ou mis à jour dans le panier existant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: Nom d'utilisateur
 *         schema:
 *           type: string
 *           example: "johndoe"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contents
 *             properties:
 *               contents:
 *                 type: array
 *                 description: Liste des produits à ajouter au panier
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - qty
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Orthèse plantaire"
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 49.99
 *                     qty:
 *                       type: integer
 *                       example: 2
 *               replace:
 *                 type: boolean
 *                 description: Indique si le panier doit être remplacé ou mis à jour
 *                 example: true
 *     responses:
 *       200:
 *         description: Panier mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Panier mis à jour avec succès"
 *       400:
 *         description: Requête invalide (paramètres manquants ou stock insuffisant)
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
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Stock insuffisant pour le produit \"Orthèse plantaire\""
 *                 path:
 *                   type: string
 *       404:
 *         description: Magasin en ligne introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Le magasin en ligne est introuvable"
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
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
 */
router.post('/:user/cart', authenticate, stocksController.updateUserCart);

/**
 * @swagger
 * /api/v1/stocks/{user}/cart:
 *   get:
 *     tags:
 *       - Panier
 *     summary: Obtenir le panier d’un utilisateur
 *     description: Retourne le contenu actuel du panier pour un utilisateur donné.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: Nom d'utilisateur
 *         schema:
 *           type: string
 *           example: "johndoe"
 *     responses:
 *       200:
 *         description: Panier récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   example: "johndoe"
 *                 total_price:
 *                   type: number
 *                   format: float
 *                   example: 129.98
 *                 contents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Orthèse plantaire"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 64.99
 *                       qty:
 *                         type: integer
 *                         example: 2
 *                       total_price:
 *                         type: number
 *                         format: float
 *                         example: 129.98
 *       400:
 *         description: Panier vide ou inexistant
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
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "Panier est vide/non-existant"
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
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
 *                   example: "/api/v1/stocks/johndoe/cart"
 */
router.get('/:user/cart', authenticate, stocksController.getUserCart);

/**
 * @swagger
 * /api/v1/stocks/{user}/cart:
 *   patch:
 *     tags:
 *       - Panier
 *     summary: Met à jour la quantité d’un article dans le panier
 *     description: |
 *       Met à jour la quantité d’un produit déjà présent dans le panier d’un utilisateur.  
 *       Vérifie également la disponibilité du stock central avant d’effectuer la mise à jour.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: Nom d'utilisateur
 *         schema:
 *           type: string
 *           example: "johndoe"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - qty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du produit à mettre à jour
 *                 example: "Orthèse plantaire"
 *               qty:
 *                 type: integer
 *                 description: Nouvelle quantité souhaitée
 *                 example: 3
 *     responses:
 *       200:
 *         description: Article mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article mis à jour avec succès"
 *       400:
 *         description: Requête invalide (paramètre manquant ou stock insuffisant)
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
 *                   example: "Stock insuffisant pour \"Orthèse plantaire\""
 *                 path:
 *                   type: string
 *       404:
 *         description: Panier ou produit introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé dans le panier"
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
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
 */
router.patch('/:user/cart', authenticate, stocksController.updateUserCartItem);

/**
 * @swagger
 * /api/v1/stocks/{user}/cart:
 *   delete:
 *     tags:
 *       - Panier
 *     summary: Supprime un produit du panier d’un utilisateur
 *     description: |
 *       Supprime un article spécifique du panier et recrédite la quantité correspondante dans le stock central.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: Nom d'utilisateur
 *         schema:
 *           type: string
 *           example: "johndoe"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - qty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du produit à supprimer
 *                 example: "Orthèse plantaire"
 *               qty:
 *                 type: integer
 *                 description: Quantité à restaurer dans l’inventaire
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produit supprimé et stock restauré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produit supprimé et stock restauré."
 *       400:
 *         description: Champs requis manquants ou invalides
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
 *                   example: "Champs invalides pour suppression"
 *                 path:
 *                   type: string
 *       404:
 *         description: Panier ou produit introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé dans le panier"
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
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
 */
router.delete('/:user/cart', authenticate, stocksController.deleteUserCartItem);

/**
 * @swagger
 * /api/v1/stocks/{user}/cart/all:
 *   delete:
 *     tags:
 *       - Panier
 *     summary: Vider complètement le panier d’un utilisateur
 *     description: |
 *       Supprime tous les articles du panier d’un utilisateur et remet le total à zéro.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user
 *         in: path
 *         required: true
 *         description: Nom d'utilisateur
 *         schema:
 *           type: string
 *           example: "johndoe"
 *     responses:
 *       200:
 *         description: Panier vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Panier vidé"
 *       400:
 *         description: Nom d'utilisateur manquant
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
 *                   example: "Nom d'utilisateuur manquant"
 *                 path:
 *                   type: string
 *       404:
 *         description: Panier ou magasin introuvable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "Panier introuvable"
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
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
 */
router.delete('/:user/cart/all', authenticate, stocksController.deleteUserCartItems);

module.exports = router;
