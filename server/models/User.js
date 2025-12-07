const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: 'student' },
    avatar: { type: String },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Add learning progress tracking
    learningProgress: [{
        courseId: String,
        completedItems: [String], // Array of item IDs (e.g. '1-3', '2-1')
        currentModule: Number,
        lastUpdated: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('User', userSchema);
