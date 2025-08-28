const Report = require('../models/report');
const User = require('../models/user');
const Watchlist = require('../models/watchlist');
const validator = require('validator');

const { 
    reportMail,
    sendRealTimeAlert
} = require('../utils/emailServices');

/**
 * @desc    Validate an instrument based on its type
 * @param   {string} instrument - The instrument to validate
 * @param   {string} type - The type of the instrument
 * @returns {boolean} - True if the instrument is valid, false otherwise
 */
const validateInstrument = (instrument, type) => {
    switch (type) {
        case 'Scam/Fraudulent Email':
            return validator.isEmail(instrument);
        case 'Fraudulent Phone Number':
            return validator.isMobilePhone(instrument, 'any', { strictMode: false });
        case 'Fraudulent Website':
            return validator.isURL(instrument, { protocols: ['http', 'https'], require_protocol: true });
        case 'Fraudulent Business':
            return typeof instrument === 'string' && instrument.length > 0;
        default:
            return false; // Disallow unknown types
    }
};

/**
 * @desc    Report a new instrument or add a review to an existing one
 * @route   POST /api/reports
 * @access  Private
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const reportInstrument = async (req, res) => {
    const { instrument, type, description, aliases } = req.body;
    const userId = req.user._id;

    try {
        // Validate the instrument
        if (!validateInstrument(instrument, type)) {
            return res.status(400).json({ message: `Invalid ${type}.` });
        }

        let report = await Report.findOne({ instrument, type });
        const isNewThreat = !report;

        if (isNewThreat) {
            report = new Report({ instrument, type, reviews: [] });
        }

        // Check if the user has already reported this instrument
        const hasUserReported = report.reviews.some(review => review.user.toString() === userId.toString());

        if (hasUserReported) {
            return res.status(400).json({ message: 'You have already reported this instrument.' });
        }

        // Add the new review
        report.reviews.push({ user: userId, description, aliases });

        const wasPublic = report.isPublic;

        // Save the report (riskLevel and isPublic will be updated automatically by the pre-save middleware)
        await report.save();

        // Notify user
        await reportMail(req.user, instrument, isNewThreat);

        // If the report just became public, send real-time alerts
        if (report.isPublic && !wasPublic) {
            const subscribers = await Watchlist.find({ category: report.type }).populate('user');
            for (const subscriber of subscribers) {
                await sendRealTimeAlert(subscriber.user, report);
            }
        }

        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * @desc    Fetch all public reports
 * @route   GET /api/reports
 * @access  Public
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
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

/**
 * @desc    Fetch all reports (for admins)
 * @route   GET /api/reports/admin
 * @access  Private/Admin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
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

/**
 * @desc    Get all instrument types
 * @route   GET /api/reports/types
 * @access  Public
 */
const getInstrumentTypes = (req, res) => {
    try {
        const instrumentTypes = Report.schema.path('type').enumValues;
        res.status(200).json({
            success: true,
            data: instrumentTypes,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

/**
 * @desc    Get total number of public threats
 * @route   GET /api/reports/stats/total
 * @access  Public
 */
const getTotalThreats = async (req, res) => {
    try {
        const total = await Report.countDocuments({ isPublic: true });
        res.status(200).json({ success: true, total });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

module.exports = { 
    reportInstrument,
    fetchAllReports,
    fetchAllReportsAdmin,
    getInstrumentTypes,
    getTotalThreats
};
