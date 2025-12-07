const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    courseId: { type: String, required: true },
    userId: { type: String, required: true }, // Changed from ObjectId to String for flexibility
    username: { type: String, required: true },
    avatar: { type: String },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
