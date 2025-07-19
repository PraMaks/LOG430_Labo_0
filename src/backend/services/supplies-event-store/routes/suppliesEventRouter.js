const express = require('express');
const router = express.Router();
const suppliesEventController = require('../controllers/suppliesEventController');

/**
 * @swagger
 * tags:
 *   name: Event Store
 *   description: Endpoints pour reconstruire l’état d’une demande via les événements stockés

 * @swagger
 * /api/v1/suppliesState/state/{aggregateId}:
 *   get:
 *     tags:
 *       - Event Store
 *     summary: Reconstituer l’état d’une demande de réapprovisionnement
 *     description: Reconstruit l’état courant d’une demande à partir de tous les événements associés à un aggregateId.
 *     parameters:
 *       - name: aggregateId
 *         in: path
 *         required: true
 *         description: Identifiant logique de la demande
 *         schema:
 *           type: string
 *           example: "req-123"
 *     responses:
 *       200:
 *         description: État reconstruit avec succès à partir de l’historique des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "req-123"
 *                 status:
 *                   type: string
 *                   example: "approuvée"
 *                 store:
 *                   type: string
 *                   example: "Magasin 3"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Pain"
 *                       quantity:
 *                         type: integer
 *                         example: 10
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
 *                   example: Internal Server Error
 *                 message:
 *                   type: string
 *                   example: Erreur de communication avec le serveur
 *                 path:
 *                   type: string
 *                   example: /api/v1/suppliesState/state/req-123
 */
router.get('/state/:aggregateId', suppliesEventController.getStateForAggregate);

module.exports = router;
