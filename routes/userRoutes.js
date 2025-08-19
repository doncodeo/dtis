const express = require('express');
const { 
    registerUser,
    verifyUser,
    verificationCode,
    login,
    forgotPassword,
    resetPassword,
    getUserStats
} = require('../controllers/userController');
const { 
    protect, 
    adminOnly 
} = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.route('/')
    .post(registerUser)

router.route('/login')
    .post(authLimiter, login)

router.route('/verify')
    .post(authLimiter, verifyUser)

router.route('/resendcode')
    .post(authLimiter, verificationCode)

router.route('/forgot-password')
    .post(forgotPassword)

router.route('/reset-password/:token')
    .post(resetPassword)

router.route('/stats')
    .get(protect, getUserStats);


module.exports = router;
