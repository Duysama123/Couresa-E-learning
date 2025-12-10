const axios = require('axios');

const API_URL = 'http://localhost:5002';
const USERNAME = 'duycomok'; // Based on screenshot
const COURSE_ID = '1';

async function testSync() {
    try {
        console.log(`Testing Sync for user: ${USERNAME}`);

        // 1. Initial State
        console.log('--- Fetching Initial State ---');
        try {
            const res1 = await axios.get(`${API_URL}/api/progress/${USERNAME}`);
            console.log('Initial Progress:', JSON.stringify(res1.data.progress, null, 2));
        } catch (e) {
            console.log('Initial Fetch Error (expected if new):', e.response?.status);
        }

        // 2. Sync Progress (Add item)
        console.log('\n--- Syncing Progress (Adding 1-1) ---');
        const syncRes = await axios.post(`${API_URL}/api/progress/sync`, {
            username: USERNAME,
            courseId: COURSE_ID,
            completedItems: ['1-1', '1-2']
        });
        console.log('Sync Response:', JSON.stringify(syncRes.data, null, 2));

        // 3. Verify State
        console.log('\n--- Fetching New State ---');
        const res2 = await axios.get(`${API_URL}/api/progress/${USERNAME}`);
        console.log('Final Progress:', JSON.stringify(res2.data.progress, null, 2));

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

testSync();
