const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },  // Field to store the verification code
    verificationCodeExpiration: { type: Date },  // Field to store expiration time for the verification code
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
    appeals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appeal' }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLogin: { type: Date },
    subscriptionStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' }, // Track subscription status
    subscriptionExpiry: { type: Date }, // Track subscription expiry date
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
