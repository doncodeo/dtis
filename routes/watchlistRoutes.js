const express = require('express');
const router = express.Router();
const {
    createWatchlistItem,
    getWatchlistItems,
    deleteWatchlistItem
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createWatchlistItem)
    .get(protect, getWatchlistItems);

router.route('/:id')
    .delete(protect, deleteWatchlistItem);

module.exports = router;
