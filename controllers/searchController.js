const Report = require('../models/report');

/**
 * @desc    Search for an instrument in the database
 * @route   POST /api/search
 * @access  Public
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const searchInstrument = async (req, res) => {
    const { instrument, type } = req.body; // Extract from request body
    const user = req.user; // `req.user` will be available if the user is authenticated

    try {
        // Validate the type
        const validTypes = ['phone', 'email', 'business', 'website', 'Fake Tech Support', 'Fraudulent Phone Number', 'Malware Distribution', 'Phishing Website', 'Scam Email'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid instrument type.' });
        }

        // Search for the instrument with the specified type
        const report = await Report.findOne({ instrument, type });

        if (!report) {
            return res.status(404).json({ message: 'Instrument not found.' });
        }

        // Check if the instrument is public
        if (!report.isPublic) {
            return res.status(200).json({ 
                message: 'This instrument exists in our database but has not received enough reports to be considered high risk.',
                report: { 
                    instrument: report.instrument, 
                    type: report.type, 
                    reviewCount: report.reviewCount,
                    riskLevel: report.riskLevel // Include risk level for more context
                }
            });
        }

        // Check if the instrument is low or medium risk
        if (report.riskLevel === 'low' || report.riskLevel === 'medium') {
            // If the user is not authenticated, deny access
            if (!user) {
                return res.status(401).json({ 
                    message: 'You need to be authenticated to view low or medium-risk instruments.' 
                });
            }

            // If the user is authenticated but not subscribed, deny access
            if (user.subscriptionStatus !== 'active' || user.subscriptionExpiry < new Date()) {
                return res.status(403).json({ 
                    message: 'You need an active subscription to view low or medium-risk instruments.' 
                });
            }
        }

        // Return the full report if it's public and the user is subscribed (if required)
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { searchInstrument };