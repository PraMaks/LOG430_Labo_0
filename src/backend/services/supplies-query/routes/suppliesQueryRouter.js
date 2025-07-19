const express = require('express');
const router = express.Router();
const suppliesQueryController = require('../controllers/suppliesQueryController');

/**
 * @swagger
 * tags:
 *   name: Supplies Query
 *   description: Endpoints pour interroger les projections de demandes de réapprovisionnement
 */

/**
 * @swagger
 * /api/v1/suppliesQuery/supplies:
 *   get:
 *     tags:
 *       - Supplies Query
 *     summary: Récupérer toutes les projections
 *     description: Retourne toutes les projections des demandes de réapprovisionnement.
 *     responses:
 *       200:
 *         description: Liste des projections retournée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   aggregateId:
 *                     type: string
 *                     example: "req-123"
 *                   store:
 *                     type: string
 *                     example: "Magasin 2"
 *                   status:
 *                     type: string
 *                     example: "créée"
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Lait"
 *                         quantity:
 *                           type: integer
 *                           example: 5
 */
router.get('/supplies', suppliesQueryController.getAll);

/**
 * @swagger
 * /api/v1/suppliesQuery/supplies/{id}:
 *   get:
 *     tags:
 *       - Supplies Query
 *     summary: Récupérer une projection par aggregateId
 *     description: Permet d’obtenir l’état d’une demande de réapprovisionnement spécifique à partir de son identifiant.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identifiant logique (aggregateId) de la demande
 *         schema:
 *           type: string
 *           example: "req-123"
 *     responses:
 *       200:
 *         description: Projection retournée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aggregateId:
 *                   type: string
 *                 store:
 *                   type: string
 *                 status:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *       404:
 *         description: Projection introuvable
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
 *                 path:
 *                   type: string
 */
router.get('/supplies/:id', suppliesQueryController.getByAggregateId);

/**
 * @swagger
 * /api/v1/suppliesQuery/replay/{aggregateId}:
 *   post:
 *     tags:
 *       - Supplies Query
 *     summary: Rejouer l’état d’une demande à partir de l’event store
 *     description: Supprime et régénère la projection d’un aggregate à partir des événements présents dans l’event store.
 *     parameters:
 *       - name: aggregateId
 *         in: path
 *         required: true
 *         description: Identifiant logique de la demande à rejouer
 *         schema:
 *           type: string
 *           example: "req-123"
 *     responses:
 *       200:
 *         description: Projection reconstruite avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Projection reconstruite pour req-123
 *       400:
 *         description: Erreur côté event store
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 *       500:
 *         description: Erreur de communication avec le serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 path:
 *                   type: string
 */
router.post('/replay/:aggregateId', suppliesQueryController.replayOneFromEventStore);

module.exports = router;