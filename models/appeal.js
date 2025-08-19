const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
    instrument: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    evidence: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'reject'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Appeal', appealSchema);