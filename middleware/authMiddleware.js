const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const userData = require('../models/user');

// const protect = asyncHandler(async (req, res, next) => {
//     let token;

//     // Check if Authorization header is set
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             // Get token from header
//             token = req.headers.authorization.split(' ')[1];

//             // Verify the token
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
//             // Log decoded information (for debugging)
//             console.log("Decoded token:", decoded);

//             // Get user from the token (use decoded.userId instead of decoded.id)
//             req.user = await userData.findById(decoded.userId).select('-password');

//             // If user does not exist, send an error
//             if (!req.user) {
//                 res.status(404);
//                 throw new Error('User not found');
//             }

//             next();
//         } catch (error) {
//             console.error(error);
//             res.status(401);
//             throw new Error('You are not authorized to access this resource');
//         }
//     } else {
//         res.status(401);
//         throw new Error('Not authorized, no token');
//     }
// });


const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Log decoded token (for debugging)
            console.log("Decoded token:", decoded);

            // Get user from the token
            req.user = await userData.findById(decoded.userId).select('-password');

            // Log the user object (for debugging)
            console.log("User fetched from DB:", req.user);

            // If user does not exist, send an error
            if (!req.user) {
                res.status(404);
                throw new Error('User not found');
            }

            // Ensure the user has a role
            if (!req.user.role) {
                res.status(403);
                throw new Error('User role is missing');
            }

            next();
        } catch (error) {
            console.error("Error in protect middleware:", error);
            res.status(401);
            throw new Error('You are not authorized to access this resource');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const adminOnly = (req, res, next) => {
    // Log the user object and role (for debugging)
    console.log("User in adminOnly middleware:", req.user);
    console.log("User role in adminOnly middleware:", req.user?.role);

    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized, only admin users can access this resource');
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (user) {
                req.user = user; // Add the user to the request object
            }
        }

        next(); // Always proceed, even if the user is not authenticated
    } catch (error) {
        next(); // Proceed without authentication
    }
};


module.exports = {
    protect,
    adminOnly,
    optionalAuth
};