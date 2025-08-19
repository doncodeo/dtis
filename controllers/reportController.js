const Report = require('../models/report');
const User = require('../models/user');
const validator = require('validator');

const { 
    reportMail
} = require('../utils/emailServices');

// Report an instrument



const validateInstrument = (instrument, type) => {
    if (type === 'email') {
        return validator.isEmail(instrument);
    } else if (type === 'phone') {
        return validator.isMobilePhone(instrument, 'any', { strictMode: false });
    } else if (type === 'website') {
        return validator.isURL(instrument, { protocols: ['http', 'https'], require_protocol: true });
    }
    return false;
};

const reportInstrument = async (req, res) => {
    const { instrument, type, description, aliases } = req.body;
    const userId = req.user._id;

    try {
        // Validate the instrument
        if (!validateInstrument(instrument, type)) {
            return res.status(400).json({ message: `Invalid ${type}.` });
        }

        let report = await Report.findOne({ instrument, type });

        if (!report) {
            report = new Report({ instrument, type, reviews: [], reviewCount: 0 });
        }

        // Check if the user has already reported this instrument
        const hasUserReported = report.reviews.some(review => review.user.toString() === userId.toString());

        if (hasUserReported) {
            return res.status(400).json({ message: 'You have already reported this instrument.' });
        }

        // Add the new review
        report.reviews.push({ user: userId, description, aliases });
        report.reviewCount += 1;

        // Save the report (riskLevel and isPublic will be updated automatically by the pre-save middleware)
        await report.save();

        // Notify user
        await reportMail(req.user, instrument);

        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// const reportInstrument = async (req, res) => {
//     const { instrument, type, description, aliases } = req.body;
//     const userId = req.user._id;

//     try {
//         let report = await Report.findOne({ instrument, type });

//         if (!report) {
//             report = new Report({ instrument, type, reviews: [], reviewCount: 0 });
//         }

//         // Check if the user has already reported this instrument
//         const hasUserReported = report.reviews.some(review => review.user.toString() === userId.toString());

//         if (hasUserReported) {
//             return res.status(400).json({ message: 'You have already reported this instrument.' });
//         }

//         // Add the new review
//         report.reviews.push({ user: userId, description, aliases });
//         report.reviewCount += 1;

//         // Save the report (riskLevel and isPublic will be updated automatically by the pre-save middleware)
//         await report.save();

//         // Notify user
//         await reportMail(req.user, instrument);

//         res.status(201).json({ message: 'Report submitted successfully', report });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

// Fetch all reported instruments (only public ones)
const fetchAllReports = async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    try {
        // Build query object
        const query = type ? { type, isPublic: true } : { isPublic: true }; // Only fetch public reports

        // Fetch reports with pagination
        const reports = await Report.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 }); // Sort by most recent

        // Get total count for pagination
        const total = await Report.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: reports,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

// Fetch all reports (admin-only) without pagination
const fetchAllReportsAdmin = async (req, res) => {
    const { type, instrument } = req.query;

    try {
        // Build query object
        const query = {};
        if (type) query.type = type;
        if (instrument) query.instrument = instrument;

        // Fetch all reports matching the query
        const reports = await Report.find(query).sort({ createdAt: -1 }); // Sort by most recent

        res.status(200).json({
            success: true,
            count: reports.length, // Total number of reports fetched
            data: reports,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

module.exports = { 
    reportInstrument,
    fetchAllReports,
    fetchAllReportsAdmin
};

