const express = require('express');
const { 
    reportInstrument,
    fetchAllReports,
    fetchAllReportsAdmin
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, reportInstrument) // For reporting an instrument
    .get(fetchAllReports)// For fetching all reports
router.route('/admin')
    .get(protect, adminOnly, fetchAllReportsAdmin); // For fetching all reports

module.exports = router;
