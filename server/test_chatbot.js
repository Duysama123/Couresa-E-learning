// Quick test script for chatbot API
const fetch = require('node-fetch');

async function testChatbot() {
    try {
        const response = await fetch('http://localhost:5001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Hello, I want to learn UX Design',
                history: []
            })
        });

        const data = await response.json();
        console.log('\n✅ Chatbot Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.text && !data.text.includes('Error')) {
            console.log('\n🎉 SUCCESS! Chatbot is working with new API key!');
        } else {
            console.log('\n❌ ERROR: Chatbot returned an error');
        }
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
    }
}

testChatbot();
