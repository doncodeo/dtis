const express = require('express');
const router = express.Router();
const {
    createWatchlistItem,
    getWatchlistItems,
    deleteWatchlistItem
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/watchlist:
 *   post:
 *     summary: Create a new watchlist item
 *     description: Creates a new watchlist item for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *             properties:
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Watchlist item created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *   get:
 *     summary: Get all watchlist items
 *     description: Retrieves all watchlist items for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of watchlist items.
 *       401:
 *         description: Unauthorized.
 */
router.route('/')
    .post(protect, createWatchlistItem)
    .get(protect, getWatchlistItems);

/**
 * @swagger
 * /api/watchlist/{id}:
 *   delete:
 *     summary: Delete a watchlist item
 *     description: Deletes a watchlist item for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the watchlist item to delete.
 *     responses:
 *       200:
 *         description: Watchlist item removed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Watchlist item not found.
 */
router.route('/:id')
    .delete(protect, deleteWatchlistItem);

module.exports = router;
