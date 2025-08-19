const Watchlist = require('../models/watchlist');
const asyncHandler = require('express-async-handler');

// @desc    Create a new watchlist item
// @route   POST /api/watchlist
// @access  Private
const createWatchlistItem = asyncHandler(async (req, res) => {
    const { category } = req.body;
    const user = req.user._id;

    if (!category) {
        return res.status(400).json({ message: 'Category is required' });
    }

    const watchlistItem = new Watchlist({
        user,
        category
    });

    const createdWatchlistItem = await watchlistItem.save();
    res.status(201).json(createdWatchlistItem);
});

// @desc    Get all watchlist items for a user
// @route   GET /api/watchlist
// @access  Private
const getWatchlistItems = asyncHandler(async (req, res) => {
    const watchlistItems = await Watchlist.find({ user: req.user._id });
    res.json(watchlistItems);
});

// @desc    Delete a watchlist item
// @route   DELETE /api/watchlist/:id
// @access  Private
const deleteWatchlistItem = asyncHandler(async (req, res) => {
    const watchlistItem = await Watchlist.findById(req.params.id);

    if (watchlistItem) {
        if (watchlistItem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await watchlistItem.remove();
        res.json({ message: 'Watchlist item removed' });
    } else {
        res.status(404).json({ message: 'Watchlist item not found' });
    }
});

module.exports = {
    createWatchlistItem,
    getWatchlistItems,
    deleteWatchlistItem
};
