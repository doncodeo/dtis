const Report = require('../models/report');
const Appeal = require('../models/appeal');

const { 
    appealMail,
    appealResolutionMail,
} = require('../utils/emailServices');


// Submit an appeal
// controllers/appealController.js
const submitAppeal = async (req, res) => {
    const { instrument, reason, evidence } = req.body;
    const userId = req.user._id;

    try {
        // 1. Check for duplicate appeal
        const existingAppeal = await Appeal.findOne({
            user: userId,
            instrument: instrument,
        });

        if (existingAppeal) {
            return res.status(400).json({
                message: "You have already submitted an appeal for this instrument.",
            });
        }

        // 2. Check if the instrument exists (optional, adjust based on your logic)
        const existingInstrument = await Report.findOne({ instrument });
        if (!existingInstrument) {
            return res.status(404).json({ message: "Instrument not found." });
        }

        // 3. Create and save the appeal
        const appeal = new Appeal({
            instrument,
            user: userId,
            reason,
            evidence,
        });

        // 4. Use a transaction to ensure atomicity
        const session = await Appeal.startSession();
        session.startTransaction();

        try {
            await appeal.save({ session });
            await appealMail(req.user, instrument); // Send email after appeal is saved

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({
                message: "Appeal submitted successfully",
                appeal,
            });
        } catch (error) {
            // Roll back the transaction on error
            await session.abortTransaction();
            session.endSession();

            console.error("Error in transaction:", error);
            throw error; // Re-throw to outer catch block
        }
    } catch (error) {
        // Log the error and send a response
        console.error("Server error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message || "Internal server error",
        });
    }
};

// const submitAppeal = async (req, res) => {
//     const { instrument, reason, evidence } = req.body;
//     const userId = req.user._id;

//     try {
//         // 1. Check for duplicate appeal
//         const existingAppeal = await Appeal.findOne({
//             user: userId,
//             instrument: instrument,
//         });

//         if (existingAppeal) {
//             return res.status(400).json({
//                 message: "You have already submitted an appeal for this instrument.",
//             });
//         }

//         // 2. Check if the instrument exists (optional, adjust based on your logic)
//         const existingInstrument = await Report.findOne({ instrument });
//         if (!existingInstrument) {
//             return res.status(404).json({ message: "Instrument not found." });
//         }

//         // 3. Create and save the appeal
//         const appeal = new Appeal({
//             instrument,
//             user: userId,
//             reason,
//             evidence,
//         });

//         // 4. Use a transaction to ensure atomicity
//         const session = await Appeal.startSession();
//         session.startTransaction();

//         try {
//             await appeal.save({ session });
//             await appealMail(req.user, instrument); // Send email after appeal is saved

//             await session.commitTransaction();
//             session.endSession();

//             res.status(201).json({
//                 message: "Appeal submitted successfully",
//                 appeal,
//             });
//         } catch (error) {
//             // Roll back the transaction on error
//             await session.abortTransaction();
//             session.endSession();

//             console.error("Error in transaction:", error);
//             throw error; // Re-throw to outer catch block
//         }
//     } catch (error) {
//         // Log the error and send a response
//         console.error("Server error:", error);
//         res.status(500).json({
//             message: "Server error",
//             error: error.message || "Internal server error",
//         });
//     }
// };

// const submitAppeal = async (req, res) => {
//     const { instrument, reason, evidence } = req.body;
//     const userId = req.user._id;

//     try {
//         // Check if the instrument exists
//         const existingInstrument = await Report.findOne({ instrument });

//         if (!existingInstrument) {
//             return res.status(404).json({ message: 'Instrument not found in the database' });
//         }

//         // Create a new appeal
//         const appeal = new Appeal({ instrument, user: userId, reason, evidence });
//         await appeal.save();

//         await reportMail(req.user, instrument);

//         res.status(201).json({ message: 'Appeal submitted successfully', appeal });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

const resolveAppeal = async (req, res) => {
    const { appealId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    try {
        // 1. Find the appeal
        const appeal = await Appeal.findById(appealId).populate('user');
        if (!appeal) {
            return res.status(404).json({ message: 'Appeal not found' });
        }

        // 2. Get the instrument associated with the appeal
        const instrument = appeal.instrument;

        // 3. Count unique reporters for the instrument
        const reportersCount = await Report.distinct('user', { instrument }).countDocuments();

        // 4. Count unique appellants for the instrument
        const appellantsCount = await Appeal.distinct('user', { instrument }).countDocuments();

        // 5. Check if counts match
        if (reportersCount !== appellantsCount) {
            return res.status(403).json({
                message: `Action blocked. ${appellantsCount}/${reportersCount} required users have appealed.`,
            });
        }

        // 6. Proceed with the action
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

// const resolveAppeal = async (req, res) => {
//     const { appealId } = req.params;
//     const { action } = req.body; // 'approve' or 'reject'

//     try {
//         const appeal = await Appeal.findById(appealId).populate('user'); // Populate the user field

//         if (!appeal) {
//             return res.status(404).json({ message: 'Appeal not found' });
//         }

//         if (action === 'approve') {
//             // Find the report associated with the appeal
//             const report = await Report.findOne({ instrument: appeal.instrument });

//             if (!report) {
//                 return res.status(404).json({ message: 'Report not found' });
//             }

//             // Hide the report from public view
//             report.isPublic = false;
//             await report.save();

//             // Mark the appeal as approved
//             appeal.status = 'approved';
//             await appeal.save();

//             // Notify the user that their appeal was approved
//             await appealResolutionMail(appeal.user, appeal.instrument, 'approved');

//             return res.status(200).json({ 
//                 message: 'Appeal approved. Report has been removed from public view.', 
//                 appeal,
//                 report
//             });
//         } else if (action === 'reject') {
//             // Mark the appeal as rejected
//             appeal.status = 'rejected';
//             await appeal.save();

//             // Notify the user that their appeal was rejected
//             await appealResolutionMail(appeal.user, appeal.instrument, 'rejected');

//             return res.status(200).json({ 
//                 message: 'Appeal rejected. Report remains public.', 
//                 appeal 
//             });
//         } else {
//             return res.status(400).json({ message: 'Invalid action' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };
module.exports = { 
    submitAppeal,
    resolveAppeal 
};




// const Report = require('../models/report');
// const Appeal = require('../models/appeal');

// // Submit an appeal
// const submitAppeal = async (req, res) => {
//     const { instrument, reason, evidence } = req.body;
//     const userId = req.user._id;

//     try {
//         // Check if the instrument exists
//         const existingInstrument = await Report.findOne({ instrument });

//         if (!existingInstrument) {
//             return res.status(404).json({ message: 'Instrument not found in the database' });
//         }

//         // Create a new appeal
//         const appeal = new Appeal({ instrument, user: userId, reason, evidence });
//         await appeal.save();

//         res.status(201).json({ message: 'Appeal submitted successfully', appeal });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

// const editAppeal = async (req, res) => {
//     const { appealId } = req.params;
//     const updates = req.body; 
//     const allowedUpdates = ['reason', 'evidence']; // List of fields allowed to be updated

//     try {
//         // Find the appeal by ID
//         const appeal = await Appeal.findById(appealId);

//         if (!appeal) {
//             return res.status(404).json({ message: 'Appeal not found' });
//         }

//         // Ensure the user is the owner of the appeal
//         if (appeal.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: 'Not authorized to edit this appeal' });
//         }

//         // Update only the allowed fields
//         for (const key in updates) {
//             if (allowedUpdates.includes(key)) {
//                 appeal[key] = updates[key];
//             }
//         }

//         // Save the updated appeal
//         await appeal.save();

//         res.status(200).json({ message: 'Appeal updated successfully', appeal });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

// const deleteAppeal = async (req, res) => {
//     const { id } = req.params; // Appeal ID
//     const userId = req.user._id; // Authenticated user's ID

//     try {
//         // Find the appeal by ID
//         const appeal = await Appeal.findById(id);

//         if (!appeal) {
//             return res.status(404).json({ message: 'Appeal not found' });
//         }

//         // Ensure the appeal belongs to the authenticated user
//         if (appeal.user.toString() !== userId.toString()) {
//             return res.status(403).json({ message: 'You are not authorized to delete this appeal' });
//         }

//         // Delete the appeal
//         await appeal.remove();

//         res.status(200).json({ message: 'Appeal deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// };


// module.exports = { 
//     submitAppeal,
//     editAppeal,
//     deleteAppeal
//  };
