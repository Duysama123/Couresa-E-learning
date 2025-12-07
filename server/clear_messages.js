const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('./models/Message');

async function clearMessages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Message.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} old messages`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

clearMessages();
