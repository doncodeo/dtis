// middleware/subscriptionMiddleware.js
const checkSubscription = async (req, res, next) => {
    const user = req.user; 

    if (user.subscriptionStatus === 'active' && user.subscriptionExpiry > new Date()) {
        next(); // Allow access
    } else {
        res.status(403).json({ message: 'You need an active subscription to submit an appeal.' });
    }
};

module.exports = checkSubscription;   