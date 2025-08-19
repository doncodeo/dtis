const Report = require('../models/report');
const Appeal = require('../models/appeal');
const { 
    appealMail,
    appealResolutionMail,
} = require('../utils/emailServices');

/**
 * @desc    Submit an appeal for a reported instrument
 * @route   POST /api/appeals
 * @access  Private
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const submitAppeal = async (req, res) => {
    const { instrument, reason, evidence } = req.body;
    const userId = req.user._id;

    try {
        // Check if the user has already submitted an appeal for this instrument
        const existingAppeal = await Appeal.findOne({
            user: userId,
            instrument: instrument,
        });

        if (existingAppeal) {
            return res.status(400).json({
                message: "You have already submitted an appeal for this instrument.",
            });
        }

        // Check if the instrument exists in the reports
        const existingInstrument = await Report.findOne({ instrument });
        if (!existingInstrument) {
            return res.status(404).json({ message: "Instrument not found." });
        }

        // Create a new appeal instance
        const appeal = new Appeal({
            instrument,
            user: userId,
            reason,
            evidence,
        });

        // Use a transaction to ensure atomicity
        const session = await Appeal.startSession();
        session.startTransaction();

        try {
            await appeal.save({ session });
            await appealMail(req.user, instrument); // Send email notification

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({
                message: "Appeal submitted successfully",
                appeal,
            });
        } catch (error) {
            // If there's an error, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error; // Re-throw to be caught by the outer catch block
        }
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message || "Internal server error",
        });
    }
};

/**
 * @desc    Resolve an appeal by approving or rejecting it
 * @route   POST /api/appeals/:appealId/resolve
 * @access  Private/Admin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const resolveAppeal = async (req, res) => {
    const { appealId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    try {
        // Find the appeal by its ID and populate the user details
        const appeal = await Appeal.findById(appealId).populate('user');
        if (!appeal) {
            return res.status(404).json({ message: 'Appeal not found' });
        }

        const instrument = appeal.instrument;

        if (action === 'approve') {
            // Find the report associated with the appeal
            const report = await Report.findOne({ instrument });

            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }

            // Hide the report from public view
            report.isPublic = false;
            await report.save();

            // Mark the appeal as approved
            appeal.status = 'approved';
            await appeal.save();

            // Notify the user that their appeal was approved
            await appealResolutionMail(appeal.user, instrument, 'approved');

            return res.status(200).json({
                message: 'Appeal approved. Report has been removed from public view.',
                appeal,
                report,
            });
        } else if (action === 'reject') {
            // Mark the appeal as rejected
            appeal.status = 'rejected';
            await appeal.save();

            // Notify the user that their appeal was rejected
            await appealResolutionMail(appeal.user, instrument, 'rejected');

            return res.status(200).json({
                message: 'Appeal rejected. Report remains public.',
                appeal,
            });
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { 
    submitAppeal,
    resolveAppeal 
};
