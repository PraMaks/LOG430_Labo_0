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
 *       - Supplies
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

/**
 * @swagger
 * /api/v1/supplies/approve/{requestId}:
 *   patch:
 *     tags:
 *       - Supplies
 *     summary: Approuver une demande de réapprovisionnement
 *     description: Permet d’approuver une demande de réapprovisionnement existante.
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: ID de la demande à approuver
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demande approuvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Demande approuvée avec succès
 *       404:
 *         description: Demande introuvable
 *       500:
 *         description: Erreur interne du serveur
 */
router.patch('/approve/:requestId', suppliesController.approveSupplyRequest);

/**
 * @swagger
 * /api/v1/supplies/reject/{requestId}:
 *   patch:
 *     tags:
 *       - Supplies
 *     summary: Rejeter une demande de réapprovisionnement
 *     description: Permet de rejeter une demande de réapprovisionnement existante.
 *     parameters:
 *       - name: requestId
 *         in: path
 *         required: true
 *         description: ID de la demande à rejeter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Demande rejetée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Demande rejetée avec succès
 *       404:
 *         description: Demande introuvable
 *       500:
 *         description: Erreur interne du serveur
 */
router.patch('/reject/:requestId', suppliesController.rejectSupplyRequest);

/**
 * @swagger
 * /api/v1/supplies/pending:
 *   get:
 *     tags:
 *       - Supplies
 *     summary: Récupérer les demandes en attente
 *     description: >
 *       Renvoie la liste de toutes les demandes de réapprovisionnement
 *       en attente dont le statut est `pending`.
 *     responses:
 *       200:
 *         description: Liste des demandes en attente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   store:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                   status:
 *                     type: string
 *                     example: pending
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/pending', suppliesController.getPendingSupplyRequests);

module.exports = router;
