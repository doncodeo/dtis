const express = require('express');
const {
    reportInstrument,
    fetchAllReports,
    fetchAllReportsAdmin,
    getInstrumentTypes,
    getTotalThreats
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     InstrumentType:
 *       type: string
 *       enum:
 *         - Fraudulent Phone Number
 *         - Fraudulent Website
 *         - Scam/Fraudulent Email
 *         - Fraudulent Business
 */

/**
 * @swagger
 * /api/reports/types:
 *   get:
 *     summary: Get all instrument types
 *     description: Retrieves a list of all possible instrument types.
 *     responses:
 *       200:
 *         description: A list of instrument types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InstrumentType'
 */
router.route('/types')
    .get(getInstrumentTypes);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Report an instrument
 *     description: Reports a new instrument or adds a review to an existing one.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instrument
 *               - type
 *               - description
 *             properties:
 *               instrument:
 *                 type: string
 *               type:
 *                 $ref: '#/components/schemas/InstrumentType'
 *               description:
 *                 type: string
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Report submitted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *   get:
 *     summary: Fetch all public reports
 *     description: Retrieves a list of all public reports.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of reports to retrieve per page.
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/InstrumentType'
 *         description: The type of reports to retrieve.
 *     responses:
 *       200:
 *         description: A list of public reports.
 */
router.route('/')
    .post(protect, reportInstrument) // For reporting an instrument
    .get(fetchAllReports); // For fetching all reports

/**
 * @swagger
 * /api/reports/admin:
 *   get:
 *     summary: Fetch all reports (for admins)
 *     description: Retrieves a list of all reports for admin users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           $ref: '#/components/schemas/InstrumentType'
 *         description: The type of reports to retrieve.
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: The instrument to filter by.
 *     responses:
 *       200:
 *         description: A list of all reports.
 *       401:
 *         description: Unauthorized.
 */
router.route('/admin')
    .get(protect, adminOnly, fetchAllReportsAdmin); // For fetching all reports

/**
 * @swagger
 * /api/reports/stats/total:
 *   get:
 *     summary: Get threat statistics
 *     description: Retrieves the total number of all reported threats and the total number of verified threats.
 *     responses:
 *       200:
 *         description: Threat statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalThreats:
 *                       type: integer
 *                     verifiedThreats:
 *                       type: integer
 */
router.route('/stats/total')
    .get(getTotalThreats);

module.exports = router;
