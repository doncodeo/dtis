const express = require('express');
const router = express.Router();
const { getAdminStats, verifyThreat, setThreatVisibility } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/stats')
    .get(protect, adminOnly, getAdminStats);

router.route('/reports/:id/verify')
    .put(protect, adminOnly, verifyThreat);

router.route('/reports/:id/set-visibility')
    .put(protect, adminOnly, setThreatVisibility);

module.exports = router;
