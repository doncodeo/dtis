const express = require('express');
const { 
    registerUser,
    verifyUser,
    verificationCode,
    login
} = require('../controllers/userController');
const { 
    protect, 
    adminOnly 
} = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(registerUser)

router.route('/login')
    .post(login)

router.route('/verify')
    .post(verifyUser)

router.route('/resendcode')
    .post(verificationCode)


module.exports = router;
