const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const sendEmail = require('./utils/sendEmail');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            const { password, ...userWithoutPassword } = user.toObject();
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/google-login', async (req, res) => {
    const { username, email, name, avatar } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            // Create new user for Google login
            user = new User({
                username,
                email,
                name,
                avatar,
                password: crypto.randomBytes(16).toString('hex'), // Dummy password
                role: 'student',
                learningProgress: []
            });
            await user.save();
        } else {
            // Update avatar if changed
            user.avatar = avatar;
            await user.save();
        }

        const { password, ...userWithoutPassword } = user.toObject();
        res.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, email, password, name } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or Email already exists' });
        }

        const newUser = new User({
            username,
            email,
            password, // In real app, hash this!
            name: name || username,
            role: 'student',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });

        await newUser.save();

        const { password: _, ...userWithoutPassword } = newUser.toObject();
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Create reset URL and message
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please use this token: ${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message,
            });

            res.json({ success: true, data: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;

    // Hash token to compare
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = password; // In real app, hash this!
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ success: true, data: 'Password reset success' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- CLOUD PROGRESS SYNC ENDPOINTS ---

// Get User Progress
app.get('/api/progress/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, progress: user.learningProgress || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Sync Progress (Upsert)
app.post('/api/progress/sync', async (req, res) => {
    const { username, courseId, completedItems } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if course progress exists
        const courseIndex = user.learningProgress.findIndex(p => p.courseId === courseId);

        if (courseIndex > -1) {
            // Update existing course progress
            // Merge unique completed items
            const currentItems = user.learningProgress[courseIndex].completedItems;
            const newItems = [...new Set([...currentItems, ...completedItems])];

            user.learningProgress[courseIndex].completedItems = newItems;
            user.learningProgress[courseIndex].lastUpdated = Date.now();
        } else {
            // Add new course progress
            user.learningProgress.push({
                courseId,
                completedItems,
                currentModule: 1 // Default start
            });
        }

        await user.save();
        res.json({ success: true, progress: user.learningProgress });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset Progress for a Course
app.post('/api/progress/reset', async (req, res) => {
    const { username, courseId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Remove progress for this specific course
        user.learningProgress = user.learningProgress.filter(p => p.courseId !== courseId);

        await user.save();
        res.json({ success: true, message: 'Progress reset successfully', progress: user.learningProgress });
    } catch (error) {
        console.error('Reset Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
app.get('/api/messages/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const messages = await Message.find({ courseId }).sort({ timestamp: 1 }).limit(100);
        res.json({ success: true, messages });
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Bot data
const BOT_PROFILES = [
    { name: "Huong Chi", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Huong" },
    { name: "Minh Tuan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan" },
    { name: "Sarah J.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "David K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { name: "AI Tutor", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Tutor" }
];

const BOT_RESPONSES = [
    "That's a great point!",
    "I was wondering about this too.",
    "Could you explain that more?",
    "This course is really helpful.",
    "I think the answer is related to user empathy.",
    "Wow, I never thought of it that way.",
    "Does anyone have the notes for Module 2?",
    "Hello everyone! Happy learning.",
    "I agree with you.",
    "This video is a bit long but very informative."
];

app.post('/api/messages', async (req, res) => {
    try {
        const { courseId, userId, username, avatar, text } = req.body;

        // Save User Message
        const userMessage = new Message({
            courseId,
            userId,
            username,
            avatar,
            text
        });
        await userMessage.save();

        res.json({ success: true, message: userMessage });

        // SIMULATE AI BOT RESPONSE (Fire and forget)
        // Only reply if it's a real user (prevent bot loops if we enabled bot-to-bot)
        if (userId !== 'bot') {
            const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5s delay

            setTimeout(async () => {
                try {
                    const randomBot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)];
                    let botText = "";

                    // Try to use Groq for a smart response
                    if (process.env.GROQ_API_KEY) {
                        try {
                            const groq = new Groq({
                                apiKey: process.env.GROQ_API_KEY
                            });

                            const completion = await groq.chat.completions.create({
                                messages: [
                                    {
                                        role: "system",
                                        content: `You are ${randomBot.name}, a student taking an online course. You are in a live study group chat. A classmate just sent a message. Reply to them naturally, keeping it short (max 1-2 sentences). Be engaging, helpful, or ask a follow-up question. Tone: Casual, friendly, student-like. NOT robotic. Context: The course is likely about UX Design, Technology, or Career Growth.`
                                    },
                                    {
                                        role: "user",
                                        content: text
                                    }
                                ],
                                model: "llama-3.3-70b-versatile",
                                temperature: 0.8,
                                max_tokens: 100
                            });

                            botText = completion.choices[0].message.content;
                        } catch (aiError) {
                            console.error("Gemini Bot Error:", aiError);
                            // Fallback will be used if botText is empty
                        }
                    }

                    // Fallback to random hardcoded response if AI failed or no Key
                    if (!botText) {
                        botText = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
                    }

                    const botMessage = new Message({
                        courseId,
                        userId: 'bot', // Special ID for bots
                        username: randomBot.name,
                        avatar: randomBot.avatar,
                        text: botText,
                        timestamp: new Date()
                    });
                    await botMessage.save();
                    console.log(`[Bot] ${randomBot.name} replied to ${courseId}: ${botText}`);
                } catch (err) {
                    console.error("Bot Error:", err);
                }
            }, randomDelay);
        }

    } catch (error) {
        console.error("Save Message Error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
