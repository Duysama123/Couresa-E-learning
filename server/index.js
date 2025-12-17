const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');
const Message = require('./models/Message');
const sendEmail = require('./utils/sendEmail');
const Groq = require('groq-sdk');

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
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight requests for 24 hours
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
app.get('/', (req, res) => {
    res.send('E-learning Backend is running with MongoDB');
});

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
// Chatbot Endpoint (OFFLINE SMART MODE)
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    console.log("Chat Request:", message);

    try {
        const lowerMsg = (message || "").toLowerCase();
        let response = {
            text: "I can help you with that! Could you tell me more about your specific interest or skill level?",
            options: ["Beginner", "Intermediate", "Advanced"]
        };

        if (lowerMsg.match(/hello|hi|hey|start|greetings/)) {
            response = {
                text: "Hi! I'm CourseMate. I'm here to help you master Cloud Computing and Digital Transformation. What would you like to explore today?",
                options: ["Cloud Computing", "DevOps", "Cybersecurity", "Web Development"]
            };
        }

        // 2. Personalized Learning Insight (Triggered by "Explore with AI" button)
        else if (lowerMsg.includes("based on my learning progress") && lowerMsg.includes("mastered analytical and creative skills")) {
            response = {
                text: "That's impressive progress! Mastering both analytical (Data Analysis) and creative (Storytelling) skills puts you in a great position for leadership roles. Based on your profile, I recommend focusing on **Applied Cloud Solutions** to scale your real-world projects.",
                courses: [
                    { title: "Cloud-Based Data Engineering on AWS", timeline: "3 months", rating: 4.8, reviews: 4200, color: "bg-indigo-50" },
                    { title: "AI Product Management Specialization", timeline: "5 months", rating: 4.7, reviews: 3100, color: "bg-teal-50" }
                ],
                options: ["View Capstone Projects", "Career Paths"]
            };
        }

        // 2.1 Handle "View Capstone Projects"
        else if (lowerMsg.includes("capstone") || lowerMsg.includes("projects")) {
            response = {
                text: "Here are some top Capstone Projects to build your portfolio:\n1. **Cloud Migration Strategy**: Design a plan to move an on-premise app to AWS.\n2. **Serverless Data Lake**: Build a data pipeline using Lambda and S3.\n3. **AI Chatbot Integration**: (You are doing this!) Integrate a smart bot into a web app.",
                options: ["Career Paths", "Back to Recommendations"]
            };
        }

        // 2.2 Handle "Career Paths"
        else if (lowerMsg.includes("career")) {
            response = {
                text: "With these skills, you can target roles like:\n- **Cloud Solutions Architect** ($120k+ avg)\n- **Data Engineer** ($110k+ avg)\n- **AI Product Manager** ($130k+ avg)\n\nStart with the Cloud-Based Data Engineering course to get there!",
                options: ["View Capstone Projects", "Back to Recommendations"]
            };
        }

        // 3. Cloud Computing Path (Main Demo Focus)
        else if (lowerMsg.includes("cloud") || lowerMsg.includes("aws") || lowerMsg.includes("azure") || lowerMsg.includes("gcp")) {

            if (lowerMsg.includes("aws") || lowerMsg.includes("amazon")) {
                response = {
                    text: "AWS is the market leader! For AWS, I highly recommend starting with the Cloud Practitioner or Solutions Architect path. Here are the best matches:",
                    courses: [
                        { title: "AWS Cloud Practitioner Essentials", timeline: "6 hours", rating: 4.8, reviews: 18500, color: "bg-orange-50" },
                        { title: "Ultimate AWS Certified Solutions Architect", timeline: "25 hours", rating: 4.9, reviews: 12000, color: "bg-yellow-50" }
                    ],
                    options: ["Explore Azure", "DevOps on AWS"]
                };
            }
            else if (lowerMsg.includes("azure") || lowerMsg.includes("microsoft")) {
                response = {
                    text: "Microsoft Azure is a powerful choice, especially for enterprise. Check out these Azure fundamentals:",
                    courses: [
                        { title: "Azure Fundamentals (AZ-900)", timeline: "8 hours", rating: 4.7, reviews: 9400, color: "bg-blue-50" },
                        { title: "Azure Administrator Associate", timeline: "30 hours", rating: 4.6, reviews: 5200, color: "bg-sky-50" }
                    ],
                    options: ["Explore AWS", "Cloud Security"]
                };
            }
            else {
                // General Cloud
                response = {
                    text: "Cloud Computing is the future! Do you have a specific cloud provider in mind, or do you want to learn the general concepts first?",
                    options: ["AWS (Amazon)", "Azure (Microsoft)", "Google Cloud", "General Concepts"]
                };
            }
        }

        // 3. DevOps & Specialized
        else if (lowerMsg.includes("devops") || lowerMsg.includes("docker") || lowerMsg.includes("kubernetes")) {
            response = {
                text: "DevOps bridges development and operations. To get started, you should learn about Containers (Docker) and Orchestration (Kubernetes).",
                courses: [
                    { title: "Docker & Kubernetes: The Practical Guide", timeline: "23 hours", rating: 4.8, reviews: 11000, color: "bg-blue-50" },
                    { title: "DevOps Bootcamp: Terraform, AWS, Docker", timeline: "40 hours", rating: 4.9, reviews: 8500, color: "bg-purple-50" }
                ],
                options: ["CI/CD Pipelines", "Back to Cloud"]
            };
        }

        // 4. UX Design (Retained)
        else if (lowerMsg.includes("ux") || lowerMsg.includes("design")) {
            response = {
                text: "Great choice! For UX Design beginners, I recommend starting with the fundamentals. Here are top-rated courses:",
                courses: [
                    { title: "Google UX Design Professional Certificate", timeline: "6 months", rating: 4.8, reviews: 12500, color: "bg-blue-50" },
                    { title: "Introduction to User Experience Design", timeline: "3 weeks", rating: 4.7, reviews: 3400, color: "bg-purple-50" }
                ],
                options: ["See Advanced Courses", "Explore Web Dev"]
            };
        }

        // 5. Web Development (Retained)
        else if (lowerMsg.includes("web") || lowerMsg.includes("code") || lowerMsg.includes("programming") || lowerMsg.includes("react") || lowerMsg.includes("frontend")) {
            response = {
                text: "For Frontend, React is the industry standard. Check out these highly recommended courses:",
                courses: [
                    { title: "Meta Front-End Developer Professional Certificate", timeline: "7 months", rating: 4.9, reviews: 8900, color: "bg-blue-50" },
                    { title: "React - The Complete Guide 2024", timeline: "40 hours", rating: 4.8, reviews: 15000, color: "bg-green-50" }
                ],
                options: ["Check Backend", "Back to Topics"]
            };
        }

        // 6. Data Science (Retained)
        else if (lowerMsg.includes("data") || lowerMsg.includes("python") || lowerMsg.includes("ai")) {
            response = {
                text: "Data Science is solving the world's problems! Do you prefer analyzing data (Analytics) or building models (AI/ML)?",
                options: ["Data Analytics", "Machine Learning", "Python Basics"]
            };
        }

        // 7. Cybersecurity Path (New)
        else if (lowerMsg.includes("security") || lowerMsg.includes("cyber") || lowerMsg.includes("hacking")) {
            response = {
                text: "Cybersecurity is critical in the digital age. Start with the basics or aim for certification.",
                courses: [
                    { title: "Google Cybersecurity Professional Certificate", timeline: "6 months", rating: 4.8, reviews: 5600, color: "bg-red-50" },
                    { title: "Introduction to Cyber Security Specialization", timeline: "4 months", rating: 4.7, reviews: 3200, color: "bg-red-50" }
                ],
                options: ["Ethical Hacking", "Network Security"]
            };
        }

        // 8. Mobile Development Path (New)
        else if (lowerMsg.includes("mobile") || lowerMsg.includes("android") || lowerMsg.includes("ios") || lowerMsg.includes("flutter")) {
            response = {
                text: "Mobile apps differ between iOS and Android. Cross-platform tools like Flutter are very popular now.",
                courses: [
                    { title: "Flutter & Dart - The Complete Guide", timeline: "42 hours", rating: 4.8, reviews: 8100, color: "bg-blue-50" },
                    { title: "Meta iOS Developer Professional Certificate", timeline: "8 months", rating: 4.9, reviews: 4500, color: "bg-gray-50" }
                ],
                options: ["React Native", "Swift vs Kotlin"]
            };
        }

        // 9. Blockchain Path (New)
        else if (lowerMsg.includes("blockchain") || lowerMsg.includes("crypto") || lowerMsg.includes("web3")) {
            response = {
                text: "Blockchain is revolutionizing trust. You can learn about the technology or how to build DApps.",
                courses: [
                    { title: "Blockchain Revolution Specialization", timeline: "3 months", rating: 4.6, reviews: 2100, color: "bg-orange-50" },
                    { title: "Solidity & Ethereum - The Complete Guide", timeline: "20 hours", rating: 4.7, reviews: 1800, color: "bg-indigo-50" }
                ],
                options: ["DeFi", "Smart Contracts"]
            };
        }

        // Return JSON directly
        res.json(response);

    } catch (error) {
        console.error("Fallback Error:", error);
        res.json({
            text: "I'm having a bit of trouble connecting right now. Why don't we try exploring our catalog directly?",
            options: ["Browse Catalog", "Contact Support"]
        });
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
