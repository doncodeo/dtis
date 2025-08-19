const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/stats')
    .get(protect, adminOnly, getAdminStats);

module.exports = router;
