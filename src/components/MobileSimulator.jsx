import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Monitor, Smartphone, Check, Play, FileText, File, Menu, User, Bell, ChevronLeft, ChevronRight, LogOut, Lock, Mail, Bot, Sparkles, Home, TrendingUp } from 'lucide-react';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import YouTubePlayer from './YouTubePlayer';
import { COURSE_CONTENT } from '../data/courseContent';

const MobileSimulator = ({ courseId, user: propUser, standalone = false }) => {
    const { login, register, user: authUser, logout } = useAuth();
    // Use authUser if available (real auth), otherwise propUser (for simple demo if needed)
    const currentUser = authUser || propUser;

    // Navigation State indicating the current screen
    // 'login', 'register', 'list', 'detail'
    const [activeScreen, setActiveScreen] = useState(currentUser ? 'home' : 'login');
    const [activeItem, setActiveItem] = useState(null);

    // Data State
    const [mobileModules, setMobileModules] = useState([]); // List of completed IDs
    const [loading, setLoading] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [authError, setAuthError] = useState('');

    // Chat State
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hi! I\'m CourseMate. Ask me anything about your learning!' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        if (activeScreen === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeScreen]);

    useEffect(() => {
        if (currentUser && (activeScreen === 'login' || activeScreen === 'register')) {
            setActiveScreen('home');
            handleRefresh(); // Initial sync
        } else if (!currentUser && activeScreen !== 'register') {
            setActiveScreen('login');
        }
    }, [currentUser]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        try {
            await login(email, password); // Using context login (arg1: username, arg2: password)
            // Effect will switch screen
        } catch (err) {
            setAuthError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        try {
            await register(email, email, password, name); // username mapped to email for simplicity in this form, or separte input? 
            // The form has name, email, password. AuthContext register takes (username, email, password, name).
            // Let's use email as username for simplicity or add username field?
            // The Login form uses 'email' state but placeholder 'Username'.
            // Let's stick to the manual axios call but FIX the login call if we want to keep specific logic, 
            // OR better: use the context register.

            // Context register: (username, email, password, name)
            // Our form has: name, email, password. 
            // Let's use email as username.
            await register(email, email, password, name);

            // If success, the effect in MobileSimulator will see currentUser and switch screen.
        } catch (err) {
            setAuthError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setActiveScreen('login');
    };

    const handleRefresh = async () => {
        if (!currentUser || !currentUser.username) return;

        setLoading(true);
        try {
            // Simulate network delay for effect
            await new Promise(r => setTimeout(r, 500));

            const res = await axios.get(`${API_URL}/api/progress/${currentUser.username}`);

            if (res.data.success && res.data.progress) {
                // Determine course ID dynamically or use prompt one. 
                // We default to '1' for this demo content if not passed.
                const targetCourseId = courseId || '1';
                const courseProgress = res.data.progress.find(p => p.courseId == targetCourseId);
                const completedIds = courseProgress ? courseProgress.completedItems : [];

                const now = new Date();
                setLastSynced(now.toLocaleTimeString());
                setMobileModules(completedIds);
            }
        } catch (error) {
            console.error("Mobile Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsComplete = async (itemId) => {
        if (!processComplete(itemId)) return;

        setLoading(true);
        try {
            // Optimistic update
            setMobileModules(prev => [...prev, itemId]);

            await axios.post(`${API_URL}/api/progress/sync`, {
                username: currentUser.username,
                courseId: courseId || '1',
                completedItems: [itemId] // API merges new items
            });
            setLastSynced("Just now");
        } catch (error) {
            console.error("Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const processComplete = (id) => {
        if (mobileModules.includes(id)) return false; // Already done
        return true;
    }

    // --- RENDER SCREENS ---

    const renderLogin = () => (
        <div className="flex flex-col h-full justify-center px-6">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                    <Smartphone size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Sign in to continue learning</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex justify-center">
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : "Log In"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">Don't have an account? <button onClick={() => setActiveScreen('register')} className="text-blue-600 font-bold">Sign Up</button></p>
            </div>
        </div>
    );

    const renderRegister = () => (
        <div className="flex flex-col h-full justify-center px-6">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-500 text-sm">Start your learning journey</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <input
                        type="text" placeholder="Full Name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        value={name} onChange={e => setName(e.target.value)} required
                    />
                </div>
                <div>
                    <input
                        type="email" placeholder="Email"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        value={email} onChange={e => setEmail(e.target.value)} required
                    />
                </div>
                <div>
                    <input
                        type="password" placeholder="Password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        value={password} onChange={e => setPassword(e.target.value)} required
                    />
                </div>
                {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex justify-center">
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : "Sign Up"}
                </button>
            </form>
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">Already removed? <button onClick={() => setActiveScreen('login')} className="text-blue-600 font-bold">Log In</button></p>
            </div>
        </div>
    );

    const renderList = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-5 pt-6 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {currentUser?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Course</h3>
                            <h2 className="text-sm font-bold text-gray-900 leading-none">Google UX Design</h2>
                        </div>
                    </div>

                    {/* Refresh Button - Moved here for visibility */}
                    <button onClick={handleRefresh} className={`p-2 ml-1 bg-gray-50 text-blue-600 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}>
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Progress Bar & Continue Learning */}
                {(() => {
                    const totalItems = COURSE_CONTENT.reduce((acc, m) => acc + m.items.length, 0);
                    const completedCount = mobileModules.length;
                    const percent = Math.round((completedCount / totalItems) * 100);

                    // Find next uncompleted item
                    let nextItem = null;
                    for (const module of COURSE_CONTENT) {
                        for (const item of module.items) {
                            if (!mobileModules.includes(item.id)) {
                                nextItem = item;
                                break;
                            }
                        }
                        if (nextItem) break;
                    }

                    return (
                        <div className="space-y-4">
                            {/* Progress */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                    <span>Course Progress</span>
                                    <span>{percent}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            {nextItem && (
                                <button
                                    onClick={() => { setActiveItem(nextItem); setActiveScreen('detail'); }}
                                    className="w-full bg-gray-900 text-white rounded-xl p-3 flex items-center justify-between shadow-lg shadow-gray-200 hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Continue Learning</p>
                                            <h4 className="text-xs font-bold truncate">{nextItem.title}</h4>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-500" />
                                </button>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* Sync Status - Removed in favor of Header Refresh */}
            {/* <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                    {loading ? "Syncing..." : lastSynced ? `Updated ${lastSynced}` : "Sync Required"}
                </span>
                <button onClick={handleRefresh} className={`p-1.5 bg-white text-blue-600 rounded-full shadow-sm border border-gray-100 ${loading ? 'animate-spin' : 'hover:scale-105 transition-transform'}`}>
                    <RefreshCw size={14} />
                </button>
            </div> */}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {COURSE_CONTENT.map(module => (
                    <div key={module.id}>
                        <h4 className="text-xs font-black text-gray-900 uppercase mb-3 px-1">{module.title}</h4>
                        <div className="space-y-3">
                            {module.items.map(item => {
                                const isCompleted = mobileModules.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => { setActiveItem(item); setActiveScreen('detail'); }}
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer active:scale-95 ${isCompleted ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? 'bg-green-500 text-white shadow-green-200' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                            {isCompleted ? <Check size={18} strokeWidth={3} /> : (
                                                item.type === 'video' ? <Play size={18} fill="currentColor" /> :
                                                    item.type === 'reading' ? <FileText size={18} /> :
                                                        <File size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className={`text-sm font-bold mb-1 truncate ${isCompleted ? 'text-gray-900' : 'text-gray-800'}`}>{item.title}</h5>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.type} • {item.duration}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDetail = () => {
        if (!activeItem) return null;
        const isCompleted = mobileModules.includes(activeItem.id);

        return (
            <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="px-4 py-4 bg-white border-b border-gray-100 flex items-center gap-3 sticky top-0 z-20">
                    <button onClick={() => setActiveScreen('list')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full text-gray-600">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide line-clamp-1">{activeItem.type}</h3>
                        <h2 className="text-sm font-bold text-gray-900 line-clamp-1">{activeItem.title}</h2>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeItem.type === 'video' && (
                        <div>
                            <YouTubePlayer url={activeItem.src} title={activeItem.title} />
                            <div className="p-5">
                                <h1 className="text-xl font-bold text-gray-900 mb-2">{activeItem.title}</h1>
                                <p className="text-sm text-gray-600 leading-relaxed">Watch this video to understand the core concepts. Tap the button below when you're done.</p>
                            </div>
                        </div>
                    )}

                    {activeItem.type === 'reading' && (
                        <div className="p-6 prose prose-sm max-w-none">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{activeItem.content?.heading || activeItem.title}</h1>
                            <p className="text-gray-600 mb-6 font-medium italic">{activeItem.content?.intro}</p>
                            {activeItem.content?.sections?.map((section, idx) => (
                                <div key={idx} className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{section.heading}</h3>
                                    <p className="text-gray-700 leading-relaxed text-sm">{section.text}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeItem.type === 'assignment' && (
                        <div className="p-5">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                <h3 className="font-bold text-blue-800 text-sm mb-1">Knowledge Check</h3>
                                <p className="text-xs text-blue-600">Answer the questions to complete this item.</p>
                            </div>

                            <form className="space-y-6">
                                {activeItem.questions?.map((q, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <p className="font-bold text-gray-900 text-sm">{idx + 1}. {q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, optIdx) => (
                                                <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                                                    <input type="radio" name={`q-${q.id}`} className="text-blue-600" />
                                                    <span className="text-sm text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-white safe-area-pb">
                    <button
                        onClick={() => { markAsComplete(activeItem.id); setActiveScreen('list'); }}
                        className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                    >
                        {isCompleted ? <><Check size={18} /> Completed</> : "Mark as Complete"}
                    </button>
                </div>
            </div>
        );
    };

    const renderNotifications = () => {
        const notifications = [
            { id: 1, type: 'grade', title: 'Grade Released', message: 'You scored 90% on Module 1 Challenge.', time: '2 hours ago', unread: true },
            { id: 2, type: 'system', title: 'System Update', message: 'The app will undergo maintenance on Sunday at 2 AM.', time: 'Yesterday', unread: false },
            { id: 3, type: 'course', title: 'New Course Available', message: 'Check out the new "Data Analytics" course.', time: '2 days ago', unread: false },
            { id: 4, type: 'reminder', title: 'Daily Goal', message: 'You are close to reaching your weekly goal!', time: '3 days ago', unread: false },
        ];

        return (
            <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="px-5 pt-8 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                        <p className="text-xs text-gray-500 font-medium">You have {notifications.filter(n => n.unread).length} unread updates</p>
                    </div>
                    <button className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <Check size={18} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                    {notifications.map(item => (
                        <div key={item.id} className={`p-4 rounded-2xl border transition-all ${item.unread ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'grade' ? 'bg-green-100 text-green-600' :
                                    item.type === 'system' ? 'bg-red-100 text-red-600' :
                                        item.type === 'course' ? 'bg-purple-100 text-purple-600' :
                                            'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {item.type === 'grade' ? <FileText size={18} /> :
                                        item.type === 'system' ? <Lock size={18} /> :
                                            item.type === 'course' ? <Play size={18} /> :
                                                <Bell size={18} />
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold ${item.unread ? 'text-blue-900' : 'text-gray-900'}`}>{item.title}</h4>
                                        <span className="text-[10px] text-gray-400 font-bold">{item.time}</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${item.unread ? 'text-blue-800' : 'text-gray-500'}`}>{item.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    // Chat Logic (Ported)
    // Chat Logic (Ported)
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: text };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({
                role: m.type === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history })
            });

            const data = await response.json();

            // Logic to parse response similar to Chatbot.jsx
            let parsedData;
            if (typeof data.text === 'object' || (data.text && !data.options && typeof data.text === 'string')) {
                try {
                    const cleanText = typeof data.text === 'string'
                        ? data.text.replace(/```json\n?|\n?```/g, '').trim()
                        : null;

                    if (cleanText && (cleanText.startsWith('{') || cleanText.startsWith('['))) {
                        parsedData = JSON.parse(cleanText);
                    } else {
                        parsedData = data.text && typeof data.text === 'object' ? data.text : data;
                    }
                } catch (e) {
                    parsedData = data;
                }
            } else {
                parsedData = data;
            }

            if (!parsedData.text && data.text) {
                parsedData = { text: typeof data.text === 'string' ? data.text : JSON.stringify(data.text) };
            }

            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: parsedData.text,
                options: parsedData.options,
                courses: parsedData.courses
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "Network error. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = () => sendMessage(chatInput);

    const renderChat = () => (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveScreen('list')} className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            CourseMate <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">AI</span>
                        </h2>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'bot' && (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-white shadow-sm">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.type === 'user'
                                ? 'bg-gray-900 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>

                        {/* Course Recommendations */}
                        {msg.courses && msg.courses.length > 0 && (
                            <div className="mt-3 ml-10 flex gap-3 overflow-x-auto pb-2 custom-scrollbar pr-4 w-full">
                                {msg.courses.map((course, idx) => (
                                    <div key={idx} className={`min-w-[200px] p-3 rounded-xl border border-gray-100 shadow-sm flex-shrink-0 bg-white`}>
                                        <div className={`w-8 h-8 rounded-lg ${course.color || 'bg-blue-50'} flex items-center justify-center mb-2`}>
                                            <FileText size={16} className="text-gray-700" />
                                        </div>
                                        <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">{course.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                            <span className="flex items-center gap-0.5 text-yellow-500 font-bold"><Sparkles size={10} /> {course.rating}</span>
                                            <span>• {course.timeline}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Options Chips */}
                        {msg.options && (
                            <div className="flex flex-wrap gap-2 mt-2 ml-10">
                                {msg.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(opt)}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 safe-area-pb">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isTyping}
                        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 disabled:opacity-50 hover:scale-105 transition-transform"
                    >
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="px-5 pt-8 pb-6 bg-white rounded-b-[30px] shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-100 mb-4 border-4 border-white">
                    {currentUser?.username?.[0]?.toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{currentUser?.name || currentUser?.username}</h2>
                <p className="text-sm text-gray-500 font-medium">{currentUser?.email}</p>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {/* Stats Card */}
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-center flex-1 border-r border-gray-100">
                        <h4 className="text-2xl font-black text-blue-600">{mobileModules.length}</h4>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Completed</p>
                    </div>
                    <div className="text-center flex-1">
                        <h4 className="text-2xl font-black text-purple-600">
                            {Math.round((mobileModules.length / COURSE_CONTENT.reduce((acc, m) => acc + m.items.length, 0)) * 100)}%
                        </h4>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">Progress</p>
                    </div>
                </div>

                {/* Settings List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {[
                        { icon: User, label: "Edit Profile" },
                        { icon: Bell, label: "Notifications" },
                        { icon: Lock, label: "Privacy & Security" },
                        { icon: Monitor, label: "App Settings" },
                    ].map((item, idx) => (
                        <button key={idx} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <item.icon size={16} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 flex-1">{item.label}</span>
                            <ChevronLeft size={16} className="rotate-180 text-gray-300" />
                        </button>
                    ))}
                </div>

                <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </div>
    );

    const renderHome = () => {
        // Mock data matching PC Dashboard
        const stats = {
            completed: mobileModules.length,
            total: COURSE_CONTENT.reduce((acc, m) => acc + m.items.length, 0),
            weeklyGrowth: 12,
            hours: 4.5
        };
        // Use stats.total to prevent reference error if statistics is undefined
        const percent = Math.round((stats.completed / (stats.total || 1)) * 100) || 0;

        return (
            <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-20 scrollbar-hide">
                {/* Header */}
                <div className="bg-white px-5 pt-8 pb-6 rounded-b-[30px] shadow-sm mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Welcome back</p>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                {currentUser?.name || currentUser?.username}
                            </h2>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                            {currentUser?.username?.[0]?.toUpperCase()}
                        </div>
                    </div>

                    {/* Main Stat Card */}
                    <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-xl shadow-gray-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Weekly Progress</p>
                                    <h3 className="text-3xl font-bold">{stats.completed}/{stats.total} <span className="text-sm text-gray-400 font-medium">Lessons</span></h3>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs font-bold">
                                        <TrendingUp size={12} /> +{stats.weeklyGrowth}%
                                    </div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400">Keep it up! You're on track to finish this week.</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 space-y-6">
                    {/* Resume Learning */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h3 className="text-lg font-bold text-gray-900">Jump Back In</h3>
                            <button onClick={() => setActiveScreen('list')} className="text-blue-600 text-xs font-bold">View Courses</button>
                        </div>
                        <div onClick={() => setActiveScreen('list')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Play size={20} fill="currentColor" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">Mobile UX</p>
                                <h4 className="text-sm font-bold text-gray-900 truncate">Sitemap & Wireframes</h4>
                            </div>
                            <div className="w-8 h-8 rounded-full border-2 border-orange-100 flex items-center justify-center text-orange-600">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>

                    {/* AI Insight */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">AI Insight</h3>
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <p className="text-xs leading-relaxed opacity-90">
                                    "You've mastered <span className="font-bold">Data Analysis</span>! Consider projects in <span className="font-bold">Predictive Storytelling</span> to boost your portfolio."
                                </p>
                            </div>
                            <button onClick={() => setActiveScreen('chat')} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors">
                                Explore with CourseMate AI
                            </button>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="pb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Top Skills</h3>
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 custom-scrollbar">
                            {[{ n: 'Data Analysis', v: 85, c: 'bg-blue-500' }, { n: 'Design', v: 72, c: 'bg-purple-500' }, { n: 'Communication', v: 64, c: 'bg-green-500' }].map((s, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[120px]">
                                    <p className="text-xs text-gray-500 font-bold mb-1">{s.n}</p>
                                    <h4 className="text-xl font-black text-gray-900 mb-2">{s.v}%</h4>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className={`h-1.5 rounded-full ${s.c}`} style={{ width: `${s.v}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className={standalone ? "flex items-center justify-center min-h-screen bg-gray-200 p-4 font-sans" : "fixed bottom-8 right-8 z-50 animate-slide-up"}>
            <div className="relative">
                {/* Phone Frame */}
                {/* 
                   Using a slightly larger frame for better usability (iPhone 14 Pro Max approx style)
                */}
                <div className="w-[360px] h-[740px] bg-gray-900 rounded-[50px] border-[12px] border-gray-900 shadow-2xl overflow-hidden relative ring-4 ring-gray-900/20">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-3xl z-30 flex justify-center items-center">
                        <div className="w-16 h-4 bg-gray-800 rounded-full opacity-50"></div>
                    </div>

                    {/* Status Bar Mock */}
                    <div className="absolute top-3 left-6 right-6 z-20 flex justify-between text-white text-[10px] font-bold opacity-80 pointer-events-none">
                        <span>9:41</span>
                        <div className="flex gap-1.5">
                            <Monitor size={12} />
                            <div className="w-4 h-2.5 border border-white rounded-[2px] relative"><div className="absolute inset-0.5 bg-white"></div></div>
                        </div>
                    </div>

                    {/* Screen Content */}
                    <div className="w-full h-full bg-white overflow-hidden pt-[40px] relative">
                        {activeScreen === 'login' && renderLogin()}
                        {activeScreen === 'register' && renderRegister()}
                        {activeScreen === 'home' && renderHome()}
                        {activeScreen === 'list' && renderList()}
                        {activeScreen === 'detail' && renderDetail()}
                        {activeScreen === 'notifications' && renderNotifications()}
                        {activeScreen === 'chat' && renderChat()}
                        {activeScreen === 'profile' && renderProfile()}

                        {/* Floating Chat Bubble (FAB) */}
                        {currentUser && activeScreen !== 'login' && activeScreen !== 'register' && activeScreen !== 'chat' && (
                            <button
                                onClick={() => setActiveScreen('chat')}
                                className="absolute bottom-20 right-4 w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-purple-200 flex items-center justify-center text-white z-40 hover:scale-110 active:scale-95 transition-all animate-bounce-subtle"
                            >
                                <Bot size={24} />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-lg border-2 border-white flex items-center justify-center">
                                    <Sparkles size={8} className="text-white" />
                                </div>
                            </button>
                        )}

                        {/* Bottom Navigation */}
                        {currentUser && activeScreen !== 'login' && activeScreen !== 'register' && activeScreen !== 'detail' && activeScreen !== 'chat' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 pb-2 safe-area-pb z-40 px-2 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                                <button
                                    onClick={() => setActiveScreen('home')}
                                    className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-colors ${activeScreen === 'home' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Home size={20} strokeWidth={activeScreen === 'home' ? 2.5 : 2} />
                                    <span className="text-[10px] font-bold mt-1">Home</span>
                                </button>
                                <button
                                    onClick={() => setActiveScreen('list')}
                                    className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-colors ${activeScreen === 'list' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <FileText size={20} strokeWidth={activeScreen === 'list' ? 2.5 : 2} />
                                    <span className="text-[10px] font-bold mt-1">Learn</span>
                                </button>
                                <button
                                    onClick={() => setActiveScreen('notifications')}
                                    className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-colors ${activeScreen === 'notifications' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Bell size={20} strokeWidth={activeScreen === 'notifications' ? 2.5 : 2} />
                                    <span className="text-[10px] font-bold mt-1">Updates</span>
                                </button>
                                <button
                                    onClick={() => setActiveScreen('profile')}
                                    className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-colors ${activeScreen === 'profile' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <User size={20} strokeWidth={activeScreen === 'profile' ? 2.5 : 2} />
                                    <span className="text-[10px] font-bold mt-1">Profile</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[120px] h-1 bg-black rounded-full z-30 opacity-20"></div>
                </div>

                {/* Info Tooltip (Desktop Only) */}
                <div className="absolute -left-48 top-20 bg-white/80 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-white/50 text-sm font-medium text-gray-600 hidden xl:block w-40 text-center animate-pulse">
                    <p>Try logging in! <br /> <span className="text-xs text-blue-600 font-bold">demo / demo123</span></p>
                    <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white/80 transform rotate-45 border-t border-r border-white/50"></div>
                </div>
            </div>

        </div>
    );
};

export default MobileSimulator;
