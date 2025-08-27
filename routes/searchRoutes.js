
// routes/searchRoutes.js
const express = require('express');
const { searchInstrument, autocompleteSearch } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/authMiddleware'); // Optional authentication middleware

const router = express.Router();

/**
 * @swagger
 * /api/search/autocomplete:
 *   get:
 *     summary: Autocomplete search for an instrument
 *     description: Searches for instruments matching a partial query string.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: The partial instrument string to search for.
 *     responses:
 *       200:
 *         description: A list of matching instruments.
 *       400:
 *         description: Missing query parameter.
 */
router.route('/autocomplete')
    .get(autocompleteSearch);

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
 *                 $ref: '#/components/schemas/InstrumentType'
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
