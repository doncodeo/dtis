const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    instrument: { type: String, required: true, unique: true }, // Ensure uniqueness
    type: { type: String, enum: ['phone', 'email', 'business', 'website'], required: true },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        description: { type: String, required: true },
        aliases: [{ type: String }]
    }],
    reviewCount: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }, // Risk classification
    isPublic: { type: Boolean, default: false } // Public visibility
}, { timestamps: true });

// Middleware to update riskLevel and isPublic before saving
reportSchema.pre('save', function (next) {
    if (this.reviewCount >= 100) {
        this.riskLevel = 'high';
    } else if (this.reviewCount >= 50 && this.reviewCount < 100) {
        this.riskLevel = 'medium';
    } else if (this.reviewCount < 50) {
        this.riskLevel = 'low';
    }

    // Make the instrument public if it has 50 or more reports
    this.isPublic = this.reviewCount >= 50;
    next();
});

module.exports = mongoose.model('Report', reportSchema);

