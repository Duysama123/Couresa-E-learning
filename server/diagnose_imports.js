
try {
    console.log('Testing Mongoose import...');
    require('mongoose');
    console.log('Mongoose imported successfully.');
} catch (e) {
    console.error('Mongoose failed:', e.message);
}

try {
    console.log('Testing Groq import...');
    require('groq-sdk');
    console.log('Groq imported successfully.');
} catch (e) {
    console.error('Groq failed:', e.message);
}

try {
    console.log('Testing dotenv import...');
    require('dotenv').config();
    console.log('Dotenv imported successfully.');
} catch (e) {
    console.error('Dotenv failed:', e.message);
}

try {
    console.log('Testing User model import...');
    require('./models/User');
    console.log('User model imported successfully.');
} catch (e) {
    console.error('User model failed:', e.message);
}

try {
    console.log('Testing Message model import...');
    require('./models/Message');
    console.log('Message model imported successfully.');
} catch (e) {
    console.error('Message model failed:', e.message);
}
