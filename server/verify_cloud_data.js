const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkCloudData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Cloud Database (MongoDB Atlas)...");

        // Find the most recently updated user or specific user
        const users = await User.find({ 'learningProgress.0': { $exists: true } });

        if (users.length === 0) {
            console.log("No users with progress found in the Cloud Database.");
        } else {
            console.log(`Found ${users.length} user(s) with synced progress.`);
            users.forEach(user => {
                console.log(`\nUser: ${user.username} (${user.email})`);
                console.log("Synced Data in Cloud:");
                console.log(JSON.stringify(user.learningProgress, null, 2));
            });
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nConnection closed.");
    }
}

checkCloudData();
