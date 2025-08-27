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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request.
 */
router.route('/')
    .post(registerUser)

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       401:
 *         description: Unauthorized.
 */
router.route('/login')
    .post(authLimiter, login)

/**
 * @swagger
 * /api/users/verify:
 *   post:
 *     summary: Verify a user's email
 *     description: Verifies a user's email address with a verification code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *             properties:
 *               email:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified successfully.
 *       400:
 *         description: Invalid verification code.
 */
router.route('/verify')
    .post(authLimiter, verifyUser)

/**
 * @swagger
 * /api/users/resendcode:
 *   post:
 *     summary: Resend verification code
 *     description: Resends a verification code to a user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code resent successfully.
 *       400:
 *         description: Bad request.
 */
router.route('/resendcode')
    .post(authLimiter, verificationCode)

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Sends a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent successfully.
 *       400:
 *         description: Bad request.
 */
router.route('/forgot-password')
    .post(forgotPassword)

/**
 * @swagger
 * /api/users/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid token or bad request.
 */
router.route('/reset-password/:token')
    .post(resetPassword)

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieves statistics for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.route('/stats')
    .get(protect, getUserStats);


module.exports = router;
