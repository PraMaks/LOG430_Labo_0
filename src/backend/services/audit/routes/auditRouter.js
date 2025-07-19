const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Endpoints pour consulter les journaux d’événements (logs)

 * @swagger
 * /api/v1/audit/logs:
 *   get:
 *     tags:
 *       - Audit
 *     summary: Obtenir les 50 derniers événements
 *     description: Retourne les 50 derniers logs d’événements, triés du plus récent au plus ancien.
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   eventId:
 *                     type: string
 *                     example: "evt-123"
 *                   type:
 *                     type: string
 *                     example: "DemandeReapprovisionnementCreee"
 *                   timestamp:
 *                     type: string
 *                     example: "2025-07-19T17:00:00.000Z"
 *                   aggregateId:
 *                     type: string
 *                     example: "req-789"
 *                   data:
 *                     type: object
 *                     description: Données de l'événement (clé-valeur)
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
 *                   example: /api/v1/audit/logs
 */
router.get('/logs', auditController.getAllLogs);

module.exports = router;
