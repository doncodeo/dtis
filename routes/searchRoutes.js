
// routes/searchRoutes.js
const express = require('express');
const { searchInstrument } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/authMiddleware'); // Optional authentication middleware

const router = express.Router();

router.route('/')
    .post(optionalAuth, searchInstrument); // Allow all users to search, but pass authenticated user if available

module.exports = router;
