const User = require('../models/user');
const Report = require('../models/report');
const Appeal = require('../models/appeal');
const asyncHandler = require('express-async-handler');

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    const totalAppeals = await Appeal.countDocuments();

    const appealsByStatus = await Appeal.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const reportsByCategory = await Report.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 }
            }
        }
    ]);

    res.json({
        totalUsers,
        totalReports,
        totalAppeals,
        appealsByStatus,
        reportsByCategory
    });
});

const verifyThreat = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (report) {
        report.verificationStatus = 'verified';
        const updatedReport = await report.save();
        res.json(updatedReport);
    } else {
        res.status(404).json({ message: 'Report not found' });
    }
});

const setThreatVisibility = asyncHandler(async (req, res) => {
    const { forcePublic } = req.body;
    const report = await Report.findById(req.params.id);

    if (report) {
        report.forcePublic = forcePublic;
        const updatedReport = await report.save();
        res.json(updatedReport);
    } else {
        res.status(404).json({ message: 'Report not found' });
    }
});

module.exports = {
    getAdminStats,
    verifyThreat,
    setThreatVisibility
};
