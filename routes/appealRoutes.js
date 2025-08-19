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

// Only subscribed users can submit appeals
router.route('/')
    .post(protect, checkSubscription, submitAppeal);

// Only admins can resolve appeals
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
