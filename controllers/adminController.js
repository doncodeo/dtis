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

module.exports = {
    getAdminStats
};
