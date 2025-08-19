const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: [
            'phone',
            'email',
            'business',
            'website',
            'Fake Tech Support',
            'Fraudulent Phone Number',
            'Malware Distribution',
            'Phishing Website',
            'Scam Email'
        ],
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only subscribe to a category once
watchlistSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
