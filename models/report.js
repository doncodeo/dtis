const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    instrument: { type: String, required: true, unique: true }, // Ensure uniqueness
    type: {
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
            'Scam Email',
            'Fraudulent Business',
            'Fraudulent Website',
            'Scam/Fraudulent Email'
        ],
        required: true
    },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        description: { type: String, required: true },
        aliases: [{ type: String }]
    }],
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }, // Risk classification
    isPublic: { type: Boolean, default: false }, // Public visibility
    verificationStatus: { type: String, enum: ['unverified', 'verified'], default: 'unverified' }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create a virtual property `reviewCount`
reportSchema.virtual('reviewCount').get(function() {
    return this.reviews.length;
});

// Middleware to update riskLevel, isPublic and verificationStatus before saving
reportSchema.pre('save', function (next) {
    const reviewCount = this.reviews.length;
    if (reviewCount >= 100) {
        this.riskLevel = 'high';
    } else if (reviewCount >= 50 && reviewCount < 100) {
        this.riskLevel = 'medium';
    } else {
        this.riskLevel = 'low';
    }

    // Make the instrument public if it has 50 or more reports
    this.isPublic = reviewCount >= 50;

    // Automatically verify the instrument if it has 200 or more reports
    if (reviewCount >= 200) {
        this.verificationStatus = 'verified';
    }

    next();
});

module.exports = mongoose.model('Report', reportSchema);
