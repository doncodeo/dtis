const bcrypt = require('bcryptjs');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const { 
    verificationMail, 
    reVerificationMail, 
    emailVerified
} = require('../utils/emailServices');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration time to 30 minutes from now
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 30); // 30 minutes

        // Create a new user with verification code and expiration time
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationCode,
            verificationCodeExpiration: expirationTime,
        });

        await newUser.save();

        // Send verification email
        try {
            await verificationMail(newUser, verificationCode);
        } catch (error) {
            console.error('Error during email sending:', error);
            return res.status(500).json({ message: 'Error sending verification email. Please try again later.' });
        }

        res.status(201).json({ message: 'User registered successfully. Check your email for verification instructions.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const verifyUser = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: 'Your account is already verified.' });
        }

        // Check if the verification code matches
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        // Check if the verification code has expired
        const currentTime = new Date();
        if (currentTime > user.verificationCodeExpiration) {
            return res.status(400).json({ message: 'Verification code has expired.' });
        }

        // If everything is okay, mark the user as verified
        user.isVerified = true;
        user.verificationCode = undefined;  // Optionally clear the verification code
        user.verificationCodeExpiration = undefined;  // Optionally clear expiration time
        await user.save();

        // Send email to inform the user their account is verified
        try {
            await emailVerified(user);  // Send the email to the user about successful verification
        } catch (error) {
            console.error('Error during email sending:', error);
            return res.status(500).json({ message: 'Error sending verification email. Please try again later.' });
        }

        res.status(200).json({ message: 'Account verified successfully.' });
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
}; 

const verificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate the email field
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the verification code has expired
        const currentTime = new Date();
        if (user.verificationCodeExpiration && currentTime > user.verificationCodeExpiration) {
            // Verification code has expired, generate a new code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Set new expiration time (30 minutes)
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 30);

            // Update the user document with the new verification code and expiration time
            user.verificationCode = verificationCode;
            user.verificationCodeExpiration = expirationTime;
            await user.save();

            // Send the new verification code via email
            try {
                await reVerificationMail(user, verificationCode);
                res.status(200).json({ message: 'A new verification code has been sent to your email.' });
            } catch (error) {
                console.error('Error sending verification email:', error);
                return res.status(500).json({ message: 'Error sending verification email. Please try again later.' });
            }
        } else {
            // Verification code is still valid, notify the user
            res.status(400).json({ message: 'Your verification code is still valid. Please use the existing code.' });
        }
    } catch (error) {
        console.error('Error requesting new verification code:', error);
        res.status(500).json({ message: 'Server error while processing the request.' });
    }
};

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    // Find user by email
    const user = await User.findOne({ email });
  
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate JWT token for authentication
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        // expiresIn: '30d', // Token expires in 30 days
        expiresIn: process.env.JWT_EXPIRATION,
      });
      res.status(200).json({ user, token });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });

module.exports = {
    registerUser,
    verifyUser,
    verificationCode,
    login
};
  