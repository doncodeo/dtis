const express = require('express');
const router = express.Router();
const { getAdminStats, verifyThreat, setThreatVisibility } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin statistics
 *     description: Retrieves statistics for the admin dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.route('/stats')
    .get(protect, adminOnly, getAdminStats);

/**
 * @swagger
 * /api/admin/reports/{id}/verify:
 *   put:
 *     summary: Verify a threat report
 *     description: Verifies a threat report, marking it as credible.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the report to verify.
 *     responses:
 *       200:
 *         description: Report verified successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Report not found.
 */
router.route('/reports/:id/verify')
    .put(protect, adminOnly, verifyThreat);

/**
 * @swagger
 * /api/admin/reports/{id}/set-visibility:
 *   put:
 *     summary: Set threat visibility
 *     description: Sets the visibility of a threat report.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the report.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isPublic
 *             properties:
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Report visibility set successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Report not found.
 */
router.route('/reports/:id/set-visibility')
    .put(protect, adminOnly, setThreatVisibility);

module.exports = router;
