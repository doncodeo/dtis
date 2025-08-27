const express = require('express');

const { 
    submitAppeal, 
    resolveAppeal,
    // editAppeal, 
    // deleteAppeal
} = require('../controllers/appealController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const checkSubscription = require('../middleware/subscriptioin'); // Import the subscription middleware

const router = express.Router();

/**
 * @swagger
 * /api/appeals:
 *   post:
 *     summary: Submit an appeal
 *     description: Submits an appeal for a reported instrument.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instrument
 *               - reason
 *             properties:
 *               instrument:
 *                 type: string
 *               reason:
 *                 type: string
 *               evidence:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appeal submitted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.route('/')
    .post(protect, checkSubscription, submitAppeal);

/**
 * @swagger
 * /api/appeals/{appealId}:
 *   post:
 *     summary: Resolve an appeal
 *     description: Resolves an appeal by approving or rejecting it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appealId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the appeal to resolve.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *     responses:
 *       200:
 *         description: Appeal resolved successfully.
 *       400:
 *         description: Invalid action.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Appeal not found.
 */
router.route('/:appealId')
    .post(protect, adminOnly, resolveAppeal);

module.exports = router;



// const express = require('express');
// const { 
//     submitAppeal, 
//     resolveAppeal,
//     // editAppeal, 
//     // deleteAppeal
// } = require('../controllers/appealController');
// const { protect, adminOnly } = require('../middleware/authMiddleware');

// const router = express.Router();

// router.route('/')
//     .post(protect, submitAppeal)

// router.route('/:appealId')
//     .post(protect, adminOnly, resolveAppeal)


// module.exports = router;
