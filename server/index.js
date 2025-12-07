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

app.get('/', (req, res) => {
    res.send('E-learning Backend is running with MongoDB');
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // Check for API Key
    if (!process.env.GEMINI_API_KEY) {
        return res.json({
            text: "I'm almost ready to be smart! But my developer needs to add a Google Gemini API Key to the .env file first. For now, I can only talk about 'Product Design'."
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-2.0-flash as listed in the available models for this key
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `You are CourseMate, an expert educational advisor with 10+ years of experience helping students find their perfect learning path.

            YOUR MISSION: Guide users to courses that truly match their goals, skill level, and learning style through thoughtful, personalized questions.

            PERSONALITY TRAITS:
            - Warm, encouraging, and supportive
            - Ask insightful questions to understand their needs
            - Provide context and reasoning for every recommendation
            - Celebrate their learning journey
            - Use friendly, conversational language (not robotic)

            CONSULTATION PROCESS:
            1. **Understand Interest**: When user mentions a topic, show enthusiasm and ask about their current experience level
            2. **Assess Skill Level**: Ask if they're a beginner, have some experience, or are advanced
            3. **Clarify Goals**: Understand WHY they want to learn (career change, skill upgrade, personal interest, etc.)
            4. **Discuss Availability**: Ask about time commitment (hours per week)
            5. **Recommend Wisely**: Suggest 2-3 courses with clear reasoning for each

            CRITICAL OUTPUT RULE: You must ONLY return a valid JSON object. Do not include any markdown formatting like \`\`\`json.
            
            The JSON object must follow this schema:
            {
                "text": "Your warm, conversational response (e.g., 'That's awesome! UX Design is such a rewarding field. Are you just starting out, or do you have some design experience already?')",
                "options": ["Beginner", "Some Experience", "Advanced"], // Optional: choices for the user
                "courses": [ // Optional: list of recommended courses
                    { 
                        "title": "Course Name", 
                        "timeline": "3-6 months", 
                        "rating": 4.8, 
                        "reviews": 120, 
                        "color": "bg-blue-50" // Use soft colors: bg-blue-50, bg-purple-50, bg-green-50, bg-orange-50
                    }
                ]
            }

            EXAMPLE INTERACTIONS:

            User: "I want to learn UX Design"
            You: { 
                "text": "That's fantastic! UX Design is such a creative and impactful field. To help me recommend the perfect course, could you tell me about your current experience level?",
                "options": ["Complete Beginner", "Some Design Experience", "Experienced Designer"]
            }

            User: "I'm a complete beginner"
            You: { 
                "text": "Perfect! Starting fresh means you can build strong foundations. What's your main goal? Are you looking to switch careers, add skills to your current role, or explore it as a hobby?",
                "options": ["Career Change", "Skill Enhancement", "Personal Interest"]
            }

            User: "Career change"
            You: { 
                "text": "That's a big and exciting step! For a career change, I recommend courses that cover the full UX process. How much time can you dedicate each week?",
                "options": ["< 5 hours/week", "5-10 hours/week", "10+ hours/week"]
            }

            User: "10+ hours/week"
            You: {
                "text": "Great! With that commitment, you can make serious progress. Here are my top recommendations for beginners aiming for a UX career:",
                "courses": [
                    {
                        "title": "UX Design Fundamentals: Complete Beginner to Pro",
                        "timeline": "3-4 months",
                        "rating": 4.9,
                        "reviews": 2340,
                        "color": "bg-blue-50"
                    },
                    {
                        "title": "Google UX Design Professional Certificate",
                        "timeline": "4-6 months",
                        "rating": 4.8,
                        "reviews": 5600,
                        "color": "bg-purple-50"
                    }
                ]
            }

            IMPORTANT TIPS:
            - Always explain WHY you're asking a question
            - When recommending courses, briefly mention what makes each one special
            - Use encouraging language ("That's awesome!", "Great choice!", "You're on the right track!")
            - Keep responses concise but warm
            - Focus on ONE question at a time to avoid overwhelming users
            `
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
                responseMimeType: "application/json" // Force JSON mode natively if supported
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error("Chat Error:", error);

        // Smart fallback when API quota exceeded or other errors
        const isQuotaError = error.message && (
            error.message.includes('quota') ||
            error.message.includes('429') ||
            error.message.includes('Too Many Requests')
        );

        if (isQuotaError) {
            // Provide helpful fallback response instead of error
            const fallbackResponse = {
                text: "I'm currently experiencing high demand, but I can still help! What type of course are you looking for?",
                options: ["UX Design", "Web Development", "Data Science", "Digital Marketing", "Product Management"]
            };

            // Check if user mentioned specific topics
            const lowerMsg = message.toLowerCase();

            if (lowerMsg.includes('ux') || lowerMsg.includes('design') || lowerMsg.includes('ui')) {
                fallbackResponse.text = "Fantastic choice! UX Design is one of the most in-demand skills today. Here are my top recommendations for you:";
                fallbackResponse.courses = [
                    {
                        title: "UX Design Fundamentals: Zero to Hero",
                        timeline: "3-6 months • Beginner Friendly",
                        rating: 4.8,
                        reviews: 1250,
                        color: "bg-blue-50"
                    },
                    {
                        title: "Advanced UI/UX Masterclass",
                        timeline: "2-4 months • Intermediate",
                        rating: 4.9,
                        reviews: 890,
                        color: "bg-purple-50"
                    },
                    {
                        title: "Design Thinking & User Research",
                        timeline: "2-3 months • All Levels",
                        rating: 4.7,
                        reviews: 650,
                        color: "bg-indigo-50"
                    }
                ];
                delete fallbackResponse.options;
            } else if (lowerMsg.includes('web') || lowerMsg.includes('development') || lowerMsg.includes('frontend') || lowerMsg.includes('backend')) {
                fallbackResponse.text = "Excellent! Web Development opens so many career doors. Here are courses tailored for different paths:";
                fallbackResponse.courses = [
                    {
                        title: "Full Stack Web Development Bootcamp",
                        timeline: "6-9 months • Beginner to Pro",
                        rating: 4.7,
                        reviews: 2100,
                        color: "bg-green-50"
                    },
                    {
                        title: "React & Modern JavaScript Mastery",
                        timeline: "3-5 months • Intermediate",
                        rating: 4.9,
                        reviews: 1560,
                        color: "bg-blue-50"
                    },
                    {
                        title: "Node.js & Backend Development",
                        timeline: "4-6 months • Intermediate",
                        rating: 4.8,
                        reviews: 980,
                        color: "bg-emerald-50"
                    }
                ];
                delete fallbackResponse.options;
            } else if (lowerMsg.includes('data') || lowerMsg.includes('science') || lowerMsg.includes('machine learning') || lowerMsg.includes('ai')) {
                fallbackResponse.text = "Perfect timing! Data Science and AI are transforming every industry. Here's your learning path:";
                fallbackResponse.courses = [
                    {
                        title: "Data Science Bootcamp: Python to ML",
                        timeline: "4-6 months • Beginner Friendly",
                        rating: 4.8,
                        reviews: 1890,
                        color: "bg-orange-50"
                    },
                    {
                        title: "Machine Learning A-Z: Hands-On",
                        timeline: "5-7 months • Intermediate",
                        rating: 4.9,
                        reviews: 3200,
                        color: "bg-purple-50"
                    },
                    {
                        title: "Deep Learning & Neural Networks",
                        timeline: "3-5 months • Advanced",
                        rating: 4.7,
                        reviews: 1450,
                        color: "bg-pink-50"
                    }
                ];
                delete fallbackResponse.options;
            } else if (lowerMsg.includes('marketing') || lowerMsg.includes('digital marketing') || lowerMsg.includes('seo')) {
                fallbackResponse.text = "Smart move! Digital Marketing skills are essential in today's business world. Check these out:";
                fallbackResponse.courses = [
                    {
                        title: "Digital Marketing Masterclass",
                        timeline: "3-5 months • All Levels",
                        rating: 4.8,
                        reviews: 2340,
                        color: "bg-rose-50"
                    },
                    {
                        title: "SEO & Content Marketing Pro",
                        timeline: "2-4 months • Beginner Friendly",
                        rating: 4.7,
                        reviews: 1120,
                        color: "bg-amber-50"
                    },
                    {
                        title: "Social Media Marketing Strategy",
                        timeline: "2-3 months • All Levels",
                        rating: 4.9,
                        reviews: 890,
                        color: "bg-cyan-50"
                    }
                ];
                delete fallbackResponse.options;
            } else if (lowerMsg.includes('product') || lowerMsg.includes('management') || lowerMsg.includes('pm')) {
                fallbackResponse.text = "Great choice! Product Management is a highly rewarding career. Here are the best courses to get you started:";
                fallbackResponse.courses = [
                    {
                        title: "Product Management Fundamentals",
                        timeline: "3-4 months • Beginner Friendly",
                        rating: 4.8,
                        reviews: 1560,
                        color: "bg-violet-50"
                    },
                    {
                        title: "Agile Product Owner Certification",
                        timeline: "2-3 months • Intermediate",
                        rating: 4.9,
                        reviews: 780,
                        color: "bg-blue-50"
                    },
                    {
                        title: "Product Strategy & Roadmapping",
                        timeline: "2-4 months • Advanced",
                        rating: 4.7,
                        reviews: 650,
                        color: "bg-purple-50"
                    }
                ];
                delete fallbackResponse.options;
            } else if (lowerMsg.includes('python') || lowerMsg.includes('programming') || lowerMsg.includes('coding')) {
                fallbackResponse.text = "Awesome! Python is the perfect language to start your coding journey. Here's what I recommend:";
                fallbackResponse.courses = [
                    {
                        title: "Python for Beginners: Complete Course",
                        timeline: "2-4 months • Beginner",
                        rating: 4.9,
                        reviews: 4200,
                        color: "bg-yellow-50"
                    },
                    {
                        title: "Advanced Python Programming",
                        timeline: "3-5 months • Intermediate",
                        rating: 4.8,
                        reviews: 1890,
                        color: "bg-green-50"
                    },
                    {
                        title: "Python for Data Analysis",
                        timeline: "3-4 months • Intermediate",
                        rating: 4.9,
                        reviews: 2100,
                        color: "bg-blue-50"
                    }
                ];
                delete fallbackResponse.options;
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
                fallbackResponse.text = "Hi there! 👋 I'm CourseMate, your personal course advisor. I'm here to help you find the perfect course for your goals. What would you like to learn?";
                fallbackResponse.options = ["UX/UI Design", "Web Development", "Data Science", "Digital Marketing", "Product Management", "Python Programming"];
            } else {
                // Keep default response for unrecognized queries
                fallbackResponse.text = "I'd love to help you find the perfect course! What area are you interested in exploring?";
                fallbackResponse.options = ["UX/UI Design", "Web Development", "Data Science", "Digital Marketing", "Product Management", "Python Programming"];
            }

            return res.json({ text: JSON.stringify(fallbackResponse) });
        }

        // For other errors, show generic message
        res.status(500).json({
            text: JSON.stringify({
                text: "Sorry, I'm having technical difficulties. Please try again in a moment, or browse our course catalog directly."
            })
        });
    }
});

const Message = require('./models/Message');

// --- CHAT ROUTES ---
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

                    // Try to use Gemini for a smart response
                    if (process.env.GEMINI_API_KEY) {
                        try {
                            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                            const model = genAI.getGenerativeModel({
                                model: "gemini-2.0-flash",
                                systemInstruction: `You are ${randomBot.name}, a student taking an online course. You are in a live study group chat.
                                A classmate just sent a message. Reply to them naturally, keeping it short (max 1-2 sentences).
                                Be engaging, helpful, or ask a follow-up question. 
                                Tone: Casual, friendly, student-like. NOT robotic.
                                Context: The course is likely about UX Design, Technology, or Career Growth.`
                            });

                            const result = await model.generateContent(text); // 'text' is the user's message
                            const response = await result.response;
                            botText = response.text();
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
