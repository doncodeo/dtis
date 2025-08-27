
// routes/searchRoutes.js
const express = require('express');
const { searchInstrument } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/authMiddleware'); // Optional authentication middleware

const router = express.Router();

/**
 * @swagger
 * /api/search:
 *   post:
 *     summary: Search for an instrument
 *     description: Searches for an instrument in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instrument
 *               - type
 *             properties:
 *               instrument:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [phone, email, business, website, 'Fake Tech Support', 'Fraudulent Phone Number', 'Malware Distribution', 'Phishing Website', 'Scam Email']
 *     responses:
 *       200:
 *         description: The search results.
 *       400:
 *         description: Invalid instrument type.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Instrument not found.
 */
router.route('/')
    .post(optionalAuth, searchInstrument); // Allow all users to search, but pass authenticated user if available

module.exports = router;
