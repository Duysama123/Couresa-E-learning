const axios = require('axios');

async function testSync() {
    try {
        console.log("Testing Sync API...");
        // 1. Login to get a valid username (mocking known user or creating one if possible? No, just use a likely existing one)
        // Let's assume 'student' or 'duy' exists. Or try to register one.

        // Actually, let's try to query a user first via the get progress endpoint? 
        // We don't have a list users endpoint.

        // Let's try to login with the hardcoded credentials if any, strictly to get a valid username.
        // User.js doesn't enforce specific users, but let's try 'testuser' if we created one.

        // BETTER: Create a user directly via mongoose script? No, let's use the API.

        const username = 'testuser_' + Date.now();
        const email = `test${Date.now()}@example.com`;

        // Register
        console.log(`Registering user: ${username}`);
        try {
            await axios.post('http://localhost:5001/api/register', {
                username,
                email,
                password: 'password123',
                name: 'Test User'
            });
        } catch (e) {
            console.log("Registration might have failed or user exists:", e.message);
        }

        // Login to confirm
        const loginRes = await axios.post('http://localhost:5001/api/login', {
            username,
            password: 'password123'
        });

        if (!loginRes.data.success) {
            throw new Error("Login failed");
        }
        console.log("Login successful, User:", loginRes.data.user.username);

        // Test Sync
        console.log("Sending Sync Request...");
        const syncRes = await axios.post('http://localhost:5001/api/progress/sync', {
            username: loginRes.data.user.username,
            courseId: '1',
            completedItems: ['1-100', '1-101']
        });

        console.log("Sync Response:", syncRes.data);

    } catch (error) {
        console.error("Test Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testSync();
