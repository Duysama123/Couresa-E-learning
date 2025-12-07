import React, { useState, useEffect, useRef } from 'react';
import {
    BookOpen, Video, FileText, CheckCircle, Circle,
    MoreVertical, MessageSquare, HelpCircle,
    ChevronDown, ChevronRight, Play, Calendar,
    Menu, X, Download, File, Edit3, Award, ArrowLeft,
    Clock, Book, User, Bell, Search, Globe, ShoppingCart,
    Star, ThumbsUp, Flag, ChevronUp, AlertCircle
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header'; // Global Header for Overview Mode
import YouTubePlayer from '../components/YouTubePlayer';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';

const COURSE_METADATA = {
    '1': {
        title: "Google UX Design Professional Certificate",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    },
    '2': {
        title: "PMP Exam Prep Certification Training Specialization",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/PMP_Logo.png/1200px-PMP_Logo.png"
    }
};

const LearningInterface = () => {
    const { id: courseId } = useParams(); // Get course ID from URL (aliased to courseId)
    const { user } = useAuth(); // Get user for syncing

    // --- STATE ---
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('course_material');
    const [activeModuleId, setActiveModuleId] = useState(1);
    const [activeLessonId, setActiveLessonId] = useState(null);
    const [activeTab, setActiveTab] = useState('transcript');
    const [expandedModules, setExpandedModules] = useState({ 1: true });

    // State for cloud sync status
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, saved, error
    const [userRating, setUserRating] = useState(0);

    // State for assignments
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});

    // Learning Plan State (Lifted from OverviewView)
    const [learningPlan, setLearningPlan] = useState(() => {
        const saved = localStorage.getItem(`learning_plan_${courseId}`);
        return saved ? JSON.parse(saved) : null;
    })
        ;
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleSavePlan = (plan) => {
        setLearningPlan(plan);
        localStorage.setItem(`learning_plan_${courseId}`, JSON.stringify(plan));
        setShowPlanModal(false);
    };

    // --- MOCK DATA CONSTANTS ---
    const MODULES_CONTENT_V2 = [
        {
            id: 1, title: "Module 1",
            subtitle: "Foundations of User Experience (UX) Design",
            items: [
                {
                    id: '1-1',
                    type: 'video',
                    title: "Welcome to the Google UX Design Certificate",
                    duration: "4 min",
                    completed: false,
                    src: "https://www.youtube.com/watch?v=8GofoyfO3TA&list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT" // Replace with your YouTube video URL
                },
                {
                    id: '1-2',
                    type: 'reading',
                    title: "Understanding the user",
                    duration: "8 min",
                    completed: false,
                    content: {
                        heading: "Understanding the user",
                        intro: "Empathy is the core of UX design. In this reading, you'll learn how to build empathy maps and user personas. Understanding your users is the critical first step in the design thinking process. By seeing the world through their eyes, we can create products that truly solve their problems.",
                        sections: [
                            {
                                heading: "What is an Empathy Map?",
                                text: "An empathy map is an easily understood chart that explains everything we know about a particular type of user. Empathy maps break down each interview into digestible pieces of information. They are divided into four quadrants: Says, Thinks, Does, and Feels.\n\n• **Says**: Quotes and defining words the user said.\n• **Thinks**: What the user is thinking throughout the experience.\n• **Does**: The actions the user takes.\n• **Feels**: The emotional state of the user.\n\nBy categorizing user feedback into these areas, we can gain a deeper understanding of their needs and motivations."
                            },
                            {
                                heading: "Creating Personas",
                                text: "Personas are fictional characters that you create based on your research to represent the different user types that might use your service, product, site, or brand in a similar way. Creating personas will help you to understand your users' needs, experiences, behaviors and goals. It can help you recognize that different people have different needs and expectations, and it can also help you identify with the user you're designing for."
                            },
                            {
                                heading: "User Stories",
                                text: "A user story is a one-sentence description of a feature told from the user's perspective. It describes the type of user, what they want and why. A user story helps to create a simplified description of a requirement. User stories are often written in the following format: 'As a <type of user>, I want <some goal> so that <some reason>'."
                            },
                            {
                                heading: "The User Journey Map",
                                text: "A user journey map is a visualization of the process that a person goes through in order to accomplish a goal. It typically follows a timeline and includes touchpoints between the user and the product. These maps help designers understand the user's motivations and pain points at each step of the process."
                            }
                        ]
                    }
                },
                {
                    id: '1-3',
                    type: 'assignment',
                    title: "Module 1 Challenge",
                    duration: "10 min",
                    completed: false,
                    grade: null,
                    questions: [
                        {
                            id: 1,
                            question: "The user experience is ______.",
                            options: [
                                "The framework of a website structure",
                                "How a person, the user, feels about interacting with or experiencing a product",
                                "The color palette and typography of a product",
                                "The code that makes the product work"
                            ],
                            correctAnswer: 1
                        },
                        {
                            id: 2,
                            question: "Which of the following is a key responsibility of a UX Designer?",
                            options: ["Writing server-side code", "Managing the company's finances", "Advocating for the user", "Designing the marketing logo"],
                            correctAnswer: 2
                        },
                        {
                            id: 3,
                            question: "What is the first step in the Design Thinking process?",
                            options: ["Define", "Ideate", "Prototype", "Empathize"],
                            correctAnswer: 3
                        }
                    ]
                },
                { id: '1-4', type: 'video', title: "The basics of user experience design", duration: "4 min", completed: false, src: "https://youtu.be/uYM161RaFLs?list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT" },
            ]
        },
        {
            id: 2, title: "Module 2",
            subtitle: "Thinking like a UX designer",
            items: [
                {
                    id: '2-1',
                    type: 'reading',
                    title: "User Research Basics",
                    duration: "5 min",
                    completed: false,
                    content: {
                        heading: "User Research Basics",
                        intro: "User research focuses on understanding user behaviors, needs, and motivations through observation techniques, task analysis, and other feedback methodologies.",
                        sections: [
                            { heading: "Qualitative vs Quantitative", text: "Qualitative research generates non-numerical data like opinions and motivations. Quantitative research generates numerical data." }
                        ]
                    }
                },
                {
                    id: '2-2',
                    type: 'assignment',
                    title: "Module 2 Quiz: User Research",
                    duration: "15 min",
                    completed: false,
                    grade: null,
                    questions: [
                        { id: 1, question: "What is primary research?", options: ["Research you conduct yourself", "Research collected by others", "Research based on guesses"], correctAnswer: 0 },
                        { id: 2, question: "Which is a qualitative method?", options: ["Survey with ratings", "User Interviews", "Web Analytics"], correctAnswer: 1 }
                    ]
                }
            ]
        },
        {
            id: 3, title: "Module 3",
            subtitle: "Build Wireframes and Low-Fidelity Prototypes",
            items: [
                {
                    id: '3-1',
                    type: 'video',
                    title: "Introduction to Wireframing",
                    duration: "6 min",
                    completed: false,
                    src: "https://youtu.be/nx0VMAES9kQ?list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT" // Replace with your YouTube video URL
                },
                {
                    id: '3-2',
                    type: 'reading',
                    title: "Benefits of Wireframing",
                    duration: "10 min",
                    completed: false,
                    content: {
                        heading: "Benefits of Wireframing",
                        intro: "Wireframes are a fundamental part of the design process. They serve as the blueprint for your design, allowing you to focus on structure and layout without getting distracted by visual details.",
                        sections: [
                            { heading: "Speed and Iteration", text: "Wireframes are quick to create and easy to change. This allows designers to iterate rapidly on different layout ideas." },
                            { heading: "Communication", text: "They act as a communication tool between designers, stakeholders, and developers to agree on the structure before high-fidelity design begins." }
                        ]
                    }
                },
                {
                    id: '3-3',
                    type: 'assignment',
                    title: "Wireframing Knowledge Check",
                    duration: "10 min",
                    completed: false,
                    grade: null,
                    questions: [
                        { id: 1, question: "What is the detailed visual design of a wireframe called?", options: ["High-fidelity", "Mockup", "Low-fidelity", "Prototype"], correctAnswer: 2 },
                        { id: 2, question: "Should you use colors in a wireframe?", options: ["Yes, always", "No, keep it grayscale", "Only for branding"], correctAnswer: 1 }
                    ]
                }
            ]
        },
        {
            id: 4, title: "Module 4",
            subtitle: "Conduct UX Research and Test Early Concepts",
            items: [
                {
                    id: '4-1',
                    type: 'video',
                    title: "Conducting Usability Studies",
                    duration: "8 min",
                    completed: false,
                    src: "https://youtu.be/m6VJ2Nv8B44?list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT" // Replace with your YouTube video URL
                },
                {
                    id: '4-2',
                    type: 'reading',
                    title: "Planning a Usability Study",
                    duration: "12 min",
                    completed: false,
                    content: {
                        heading: "Planning a Usability Study",
                        intro: "A usability study is a research method that assesses how easy it is for participants to complete core tasks in a design. Planning is crucial for getting actionable insights.",
                        sections: [
                            { heading: "Defining Goals", text: "What do you want to learn? Are you testing the navigation? The checkout flow?" },
                            { heading: "Recruiting Participants", text: "You need to find participants that represent your target user persona." }
                        ]
                    }
                },
                {
                    id: '4-3',
                    type: 'assignment',
                    title: "Research Plan Quiz",
                    duration: "15 min",
                    completed: false,
                    grade: null,
                    questions: [
                        { id: 1, question: "What is a moderator?", options: ["A person who guides the participant", "The participant", "The note taker"], correctAnswer: 0 },
                        { id: 2, question: "What is an unmoderated study?", options: ["A study with no participants", "A study where participants complete tasks alone", "A study without a plan"], correctAnswer: 1 }
                    ]
                }
            ]
        }
    ];

    // MOCK DATA IN STATE - PERSISTED
    const [modules, setModules] = useState(() => {
        // Try to load course-specific data first
        const courseKey = courseId ? `course_modules_data_${courseId}` : 'course_modules_data';
        const saved = localStorage.getItem(courseKey);

        if (saved) {
            try {
                // Merge saved progress/status with new Content (V2)
                const savedModules = JSON.parse(saved);

                // If saved modules are valid, we want to keep their 'completed' and 'grade' status
                // but use the 'content' and 'questions' from MODULES_CONTENT_V2
                const mergedModules = MODULES_CONTENT_V2.map(v2Mod => {
                    const savedMod = savedModules.find(sm => sm.id === v2Mod.id);
                    if (!savedMod) return v2Mod;

                    return {
                        ...v2Mod,
                        items: v2Mod.items.map(v2Item => {
                            const savedItem = savedMod.items.find(si => si.id === v2Item.id);
                            if (!savedItem) return v2Item;
                            // Keep saved status, use new content/questions
                            return {
                                ...v2Item,
                                completed: savedItem.completed,
                                grade: savedItem.grade,
                                submittedDate: savedItem.submittedDate
                            };
                        })
                    };
                });
                return mergedModules;

            } catch (e) {
                console.error("Failed to parse saved course data", e);
            }
        }
        return MODULES_CONTENT_V2;
    });

    // --- CLOUD SYNC LOGIC ---

    // 1. Fetch Cloud Progress on Mount
    useEffect(() => {
        if (!user || !user.username) return;

        const fetchCloudProgress = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/progress/${user.username}`);
                if (res.data.success && res.data.progress) {
                    const courseProgress = res.data.progress.find(p => p.courseId === courseId);

                    if (courseProgress && courseProgress.completedItems.length > 0) {
                        console.log("Cloud Sync: Found progress", courseProgress);

                        // Merge Cloud Progress into Local State
                        setModules(prevModules => prevModules.map(module => ({
                            ...module,
                            items: module.items.map(item => {
                                // If cloud says completed, mark completed. Otherwise keep local state.
                                const isCompletedInCloud = courseProgress.completedItems.includes(item.id);
                                return isCompletedInCloud ? { ...item, completed: true } : item;
                            })
                        })));
                    }
                }
            } catch (error) {
                console.error("Cloud Sync Error (Fetch):", error);
            }
        };

        fetchCloudProgress();
    }, [user, courseId]);

    // 2. Sync to Cloud on Change (Debounced or Event-Driven)
    const syncProgressToCloud = async (updatedModules) => {
        if (!user || !user.username) return;

        // Extract completed item IDs
        const completedItems = updatedModules.flatMap(m => m.items)
            .filter(i => i.completed)
            .map(i => i.id);

        if (completedItems.length === 0) return;

        try {
            setSyncStatus('syncing');
            await axios.post(`${API_URL}/api/progress/sync`, {
                username: user.username,
                courseId: courseId,
                completedItems: completedItems
            });
            console.log("Cloud Sync: Saved successfully");
            setSyncStatus('saved');
            setTimeout(() => setSyncStatus('idle'), 3000); // Hide after 3s
        } catch (error) {
            console.error("Cloud Sync Error (Save):", error);
            setSyncStatus('error');
        }
    };

    // Save to localStorage whenever modules change
    useEffect(() => {
        const courseKey = courseId ? `course_modules_data_${courseId}` : 'course_modules_data';
        localStorage.setItem(courseKey, JSON.stringify(modules));
    }, [modules, courseId]);

    // Force update if the loaded data is missing new content (just in case useState logic didn't catch a live update scenarios)
    useEffect(() => {
        const hasQuestions = modules[0]?.items?.find(i => i.id === '1-3')?.questions;
        const missingNewModules = modules.length < MODULES_CONTENT_V2.length;

        if (!hasQuestions || missingNewModules) {
            const mergedModules = MODULES_CONTENT_V2.map(v2Mod => {
                const savedMod = modules.find(sm => sm.id === v2Mod.id);
                if (!savedMod) return v2Mod;
                return {
                    ...v2Mod,
                    items: v2Mod.items.map(v2Item => {
                        const savedItem = savedMod.items.find(si => si.id === v2Item.id);
                        if (!savedItem) return v2Item;
                        return { ...v2Item, completed: savedItem.completed, grade: savedItem.grade, submittedDate: savedItem.submittedDate };
                    })
                };
            });
            setModules(mergedModules);
        }
    }, [modules.length]); // Check on mount or if length changes


    // --- COMPUTED VALUES ---

    // Find current active item across all modules
    const currentLesson = modules.flatMap(m => m.items).find(i => i.id === activeLessonId);

    // Filter current module ID based on activeLessonId to expand sidebar automatically
    useEffect(() => {
        if (activeLessonId) {
            const parentModule = modules.find(m => m.items.some(i => i.id === activeLessonId));
            if (parentModule) {
                setExpandedModules(prev => ({ ...prev, [parentModule.id]: true }));
            }
        }
    }, [activeLessonId, modules]);

    // --- ACTIONS ---

    const handleResetProgress = () => {
        // Show modal instead of window.confirm
        setShowResetModal(true);
    };

    const confirmReset = async () => {
        setShowResetModal(false);

        // Reset all modules
        setModules(prevModules =>
            prevModules.map(module => ({
                ...module,
                items: module.items.map(item => ({
                    ...item,
                    completed: false,
                    grade: undefined,
                    submittedDate: undefined
                }))
            }))
        );

        // Clear cloud progress
        if (user && user.username) {
            try {
                await axios.post(`${API_URL}/api/progress/reset`, {
                    username: user.username,
                    courseId: courseId
                });
                // Show success notification
                setResetSuccess(true);
                setTimeout(() => setResetSuccess(false), 3000);
            } catch (error) {
                console.error('Reset progress error:', error);
                // Still show success for local reset
                setResetSuccess(true);
                setTimeout(() => setResetSuccess(false), 3000);
            }
        } else {
            // Show success notification
            setResetSuccess(true);
            setTimeout(() => setResetSuccess(false), 3000);
        }
    };

    const toggleModule = (id) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleNextItem = () => {
        if (!activeLessonId) return;

        // 1. Mark current item as completed
        setModules(prevModules => {
            const newModules = prevModules.map(module => ({
                ...module,
                items: module.items.map(item =>
                    item.id === activeLessonId ? { ...item, completed: true } : item
                )
            }));

            // Trigger Cloud Sync
            syncProgressToCloud(newModules);

            return newModules;
        });

        // 2. Find next item
        const allItems = modules.flatMap(m => m.items);
        const currentIndex = allItems.findIndex(i => i.id === activeLessonId);

        if (currentIndex < allItems.length - 1) {
            const nextItem = allItems[currentIndex + 1];
            setActiveLessonId(nextItem.id);
            // Reset states for specific views
            setQuizStarted(false);
            window.scrollTo(0, 0);
        } else {
            alert("Congratulations! You have completed all available lessons.");
        }
    };

    // --- Sub-components with updated props ---

    const ReadingView = ({ data }) => (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{data.content?.heading || data.title}</h1>

            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                <p className="mb-10 text-xl font-light text-gray-700">{data.content?.intro}</p>

                {data.content?.sections?.map((section, idx) => (
                    <div key={idx} className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.heading}</h2>
                        <p className="text-base text-gray-700">{section.text}</p>
                    </div>
                ))}
            </div>

            <div className="mt-16 flex justify-between items-center border-t border-gray-100 pt-8">
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-[#1967d2] font-semibold text-sm transition-colors">
                        <ThumbsUp size={18} /> Helpful
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-[#1967d2] font-semibold text-sm transition-colors">
                        <Flag size={18} /> Report
                    </button>
                </div>
                <button
                    onClick={handleNextItem}
                    className="flex items-center gap-2 bg-[#1967d2] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#1557b0] transition-colors shadow-md"
                >
                    Go to next item <ChevronRight size={20} />
                </button>
            </div>
        </div >
    );

    const handleAssignmentSubmit = (score, totalPoints) => {
        if (!activeLessonId) return;

        const percentage = Math.round((score / totalPoints) * 100);

        setModules(prevModules => {
            const newModules = prevModules.map(module => ({
                ...module,
                items: module.items.map(item =>
                    item.id === activeLessonId
                        ? { ...item, completed: true, grade: `${percentage}%`, submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
                        : item
                )
            }));
            // Trigger Cloud Sync
            syncProgressToCloud(newModules);

            return newModules;
        });

        handleNextItem();
    };

    const AssignmentView = ({ data }) => {
        // Use questions from data, fallback to empty array
        const questions = data.questions || [];

        const calculateGrade = () => {
            let score = 0;
            questions.forEach(q => {
                if (quizAnswers[q.id] === q.correctAnswer) {
                    score += 1;
                }
            });
            return { score, total: questions.length };
        };

        if (!quizStarted) {
            return (
                <div className="max-w-4xl mx-auto animate-fade-in">
                    {/* Header Alert */}
                    <div className="bg-[#fff8e1] border border-[#fce8b2] rounded p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="text-[#e37400] flex-shrink-0" size={20} />
                        <span className="text-sm text-gray-800">Course Staff updated this assessment. You'll see the changes when you start or edit.</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.title}</h1>

                    {/* Info Card */}
                    <div className="bg-[#f8f9fa] rounded-xl p-8 mb-8 border border-gray-100 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-6 text-lg">Assignment details</h2>
                        <div className="grid grid-cols-2 gap-y-8 gap-x-12 text-sm">
                            <div>
                                <div className="font-bold text-gray-900 mb-1">Due</div>
                                <div className="text-gray-600">Dec 15, 11:59 PM +07</div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 mb-1">Attempts</div>
                                <div className="text-gray-600">3 left <span className="text-gray-400">(3 attempts every 24 hours)</span></div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 mb-1">Submitted</div>
                                <div className="text-gray-600">{data.submittedDate || '--'}</div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 mb-1">Time limit</div>
                                <div className="text-gray-600">1h 15m per attempt</div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end border-t border-gray-200 pt-6">
                            <button
                                onClick={() => setQuizStarted(true)}
                                className="bg-[#1967d2] hover:bg-[#1557b0] text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm"
                            >
                                {data.grade ? 'Retake Assignment' : 'Start Assignment'}
                            </button>
                        </div>
                    </div>

                    {/* Previous Grade (Mock) */}
                    <div className="bg-[#e6f4ea] rounded-xl p-6 flex justify-between items-center border border-[#ceead6]">
                        <div>
                            <h3 className="font-bold text-gray-900">Your grade</h3>
                            <div className="text-sm text-gray-600 mt-1">To pass you need at least 80%. We keep your highest score.</div>
                            <div className="text-3xl font-bold text-[#137333] mt-2">{data.grade || '--%'}</div>
                        </div>
                        <div className="flex gap-4 text-sm font-bold text-[#1967d2]">
                            <button className="hover:underline">View submission</button>
                            <button className="hover:underline">See feedback</button>
                        </div>
                    </div>
                </div>
            );
        }

        // Active Quiz View
        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8 sticky top-0 bg-white z-10 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                        <Clock size={16} className="text-gray-500" />
                        <span>00:45:00 remaining</span>
                    </div>
                </div>

                <div className="space-y-12">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="border-b border-gray-100 pb-10 last:border-0">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-gray-900 text-lg flex gap-3">
                                    <span className="text-gray-500 min-w-[24px]">{idx + 1}.</span>
                                    {q.question}
                                </h3>
                                <span className="bg-[#e8f0fe] text-[#1967d2] text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">1 point</span>
                            </div>

                            <div className="space-y-4 pl-9">
                                {q.options.map((opt, optIdx) => (
                                    <label key={optIdx} className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 -ml-2 transition-colors">
                                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${quizAnswers[q.id] === optIdx ? 'border-[#1967d2]' : 'border-gray-400 group-hover:border-gray-500'}`}>
                                            {quizAnswers[q.id] === optIdx && <div className="w-2.5 h-2.5 rounded-full bg-[#1967d2]" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            className="hidden"
                                            onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                            checked={quizAnswers[q.id] === optIdx}
                                        />
                                        <span className={`text-base ${quizAnswers[q.id] === optIdx ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                        <label className="flex items-start gap-2 cursor-pointer max-w-lg">
                            <input type="checkbox" className="mt-1 rounded border-gray-300" />
                            <span>I understand that submitting work that isn't my own may result in permanent failure of this course or deactivation of my Coursera account.</span>
                        </label>
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="text-[#1967d2] font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                            onClick={() => console.log('Saved')}
                        >
                            Save Draft
                        </button>
                        <button
                            className="bg-[#1967d2] hover:bg-[#1557b0] text-white font-bold px-10 py-3 rounded-lg shadow-sm transition-colors"
                            onClick={() => {
                                const { score, total } = calculateGrade();
                                alert(`Assignment Submitted successfully! You scored ${score}/${total}`);
                                handleAssignmentSubmit(score, total);
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- MODE 1: LEARNING MODE (Focus View) ---
    const LearningMode = () => {
        const [currentTime, setCurrentTime] = useState(0);
        const videoRef = useRef(null);
        const [savedNotes, setSavedNotes] = useState([]);
        const [noteInput, setNoteInput] = useState('');

        // --- CHAT STATE ---
        // Pre-populate with sample messages to simulate active discussion
        const SAMPLE_MESSAGES = [
            {
                _id: 'sample-1',
                courseId,
                userId: 'sample-user-1',
                username: 'Sarah Chen',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
                text: 'Just started this course! Excited to learn UX design from scratch.',
                timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
            },
            {
                _id: 'sample-2',
                courseId,
                userId: 'sample-user-2',
                username: 'Alex Martinez',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMartinez',
                text: 'Welcome Sarah! This course is amazing. The instructor explains everything so clearly.',
                timestamp: new Date(Date.now() - 7000000).toISOString() // ~1h 56min ago
            },
            {
                _id: 'sample-3',
                courseId,
                userId: 'sample-user-3',
                username: 'Minh Nguyen',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinhNguyen',
                text: 'Has anyone tried the Figma plugin mentioned in the video?',
                timestamp: new Date(Date.now() - 5400000).toISOString() // 1.5 hours ago
            },
            {
                _id: 'sample-4',
                courseId,
                userId: 'sample-user-4',
                username: 'Emma Wilson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaWilson',
                text: 'Yes! It\'s really helpful for creating design systems. Saves a lot of time!',
                timestamp: new Date(Date.now() - 5200000).toISOString() // ~1h 26min ago
            },
            {
                _id: 'sample-5',
                courseId,
                userId: 'sample-user-5',
                username: 'David Kim',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidKim',
                text: 'I\'m struggling with creating user personas. Any tips?',
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            },
            {
                _id: 'sample-6',
                courseId,
                userId: 'sample-user-6',
                username: 'Priya Patel',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaPatel',
                text: 'Start with real user interviews! I interviewed 5-7 people and it really helped me understand different perspectives.',
                timestamp: new Date(Date.now() - 3400000).toISOString() // ~56min ago
            },
            {
                _id: 'sample-7',
                courseId,
                userId: 'sample-user-7',
                username: 'James Lee',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesLee',
                text: 'The empathy mapping section was so insightful! 👍',
                timestamp: new Date(Date.now() - 2700000).toISOString() // 45 min ago
            },
            {
                _id: 'sample-8',
                courseId,
                userId: 'sample-user-8',
                username: 'Sofia Rodriguez',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SofiaRodriguez',
                text: 'Does anyone have examples of good empathy maps I can reference?',
                timestamp: new Date(Date.now() - 2400000).toISOString() // 40 min ago
            },
            {
                _id: 'sample-9',
                courseId,
                userId: 'sample-user-9',
                username: 'Aisha Khan',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AishaKhan',
                text: 'Check out Nielsen Norman Group\'s website! They have great templates and case studies.',
                timestamp: new Date(Date.now() - 2200000).toISOString() // ~36min ago
            },
            {
                _id: 'sample-10',
                courseId,
                userId: 'sample-user-10',
                username: 'Lucas Silva',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LucasSilva',
                text: 'Taking notes on everything. So much valuable information in this module!',
                timestamp: new Date(Date.now() - 1800000).toISOString() // 30 min ago
            },
            {
                _id: 'sample-11',
                courseId,
                userId: 'sample-user-3',
                username: 'Minh Nguyen',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinhNguyen',
                text: 'Quick question: What\'s the difference between low-fi and high-fi prototypes?',
                timestamp: new Date(Date.now() - 1500000).toISOString() // 25 min ago
            },
            {
                _id: 'sample-12',
                courseId,
                userId: 'sample-user-6',
                username: 'Priya Patel',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaPatel',
                text: 'Low-fi is more about structure and layout (think sketches), while high-fi includes colors, images, and detailed interactions. Both are important at different stages!',
                timestamp: new Date(Date.now() - 1400000).toISOString() // ~23min ago
            },
            {
                _id: 'sample-13',
                courseId,
                userId: 'sample-user-1',
                username: 'Sarah Chen',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
                text: 'The wireframing examples are so practical! Can\'t wait to apply this to my portfolio project.',
                timestamp: new Date(Date.now() - 1200000).toISOString() // 20 min ago
            },
            {
                _id: 'sample-14',
                courseId,
                userId: 'sample-user-4',
                username: 'Emma Wilson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaWilson',
                text: 'Is it worth learning Adobe XD or should I stick with Figma?',
                timestamp: new Date(Date.now() - 900000).toISOString() // 15 min ago
            },
            {
                _id: 'sample-15',
                courseId,
                userId: 'sample-user-7',
                username: 'James Lee',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesLee',
                text: 'Figma is more popular now and cloud-based. I\'d recommend focusing on Figma for better collaboration.',
                timestamp: new Date(Date.now() - 800000).toISOString() // ~13min ago
            },
            {
                _id: 'sample-16',
                courseId,
                userId: 'sample-user-5',
                username: 'David Kim',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidKim',
                text: 'Just got my first UX job offer! This course helped so much. Thank you! 🎉',
                timestamp: new Date(Date.now() - 600000).toISOString() // 10 min ago
            },
            {
                _id: 'sample-17',
                courseId,
                userId: 'sample-user-8',
                username: 'Sofia Rodriguez',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SofiaRodriguez',
                text: 'Congrats David! That\'s amazing! 👏',
                timestamp: new Date(Date.now() - 500000).toISOString() // ~8min ago
            },
            {
                _id: 'sample-18',
                courseId,
                userId: 'sample-user-10',
                username: 'Lucas Silva',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LucasSilva',
                text: 'I\'m rewatching this section. The accessibility guidelines are so important but can be overwhelming. Where should I start?',
                timestamp: new Date(Date.now() - 180000).toISOString() // 3 min ago
            }
        ];

        const [messages, setMessages] = useState(SAMPLE_MESSAGES);
        const [chatInput, setChatInput] = useState('');
        const chatContainerRef = useRef(null);
        const lastMessageCountRef = useRef(SAMPLE_MESSAGES.length);

        // Scroll to bottom helper
        const scrollToBottom = () => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        };

        // Auto-scroll only on NEW messages
        useEffect(() => {
            if (messages.length > lastMessageCountRef.current) {
                scrollToBottom();
                lastMessageCountRef.current = messages.length;
            }
        }, [messages]);

        // Fetch Messages Polling
        useEffect(() => {
            const fetchMessages = async () => {
                if (activeTab !== 'discuss') return;
                try {
                    const res = await axios.get(`${API_URL}/api/messages/${courseId}`);
                    if (res.data && res.data.success) {
                        const serverMessages = res.data.messages || [];
                        setMessages(prev => {
                            // Keep temp messages (optimistic UI) and auto-generated messages
                            const localMessages = prev.filter(m => m.isTemp || m.isAutoGenerated);
                            const uniqueLocalMessages = localMessages.filter(t =>
                                !serverMessages.some(s => s.text === t.text && s.username === t.username)
                            );
                            return [...serverMessages, ...uniqueLocalMessages];
                        });
                    }
                } catch (error) {
                    // console.error("Chat polling error:", error);
                }
            };

            if (activeTab === 'discuss') {
                fetchMessages();
                const interval = setInterval(fetchMessages, 3000);
                return () => clearInterval(interval);
            }
        }, [courseId, activeTab]);

        // Auto-generate simulated messages to make chat feel alive
        useEffect(() => {
            if (activeTab !== 'discuss') return;

            // Pool of students for conversations
            const STUDENTS = [
                { name: 'Sarah Chen', seed: 'SarahChen' },
                { name: 'Alex Martinez', seed: 'AlexMartinez' },
                { name: 'Minh Nguyen', seed: 'MinhNguyen' },
                { name: 'Emma Wilson', seed: 'EmmaWilson' },
                { name: 'David Kim', seed: 'DavidKim' },
                { name: 'Priya Patel', seed: 'PriyaPatel' },
                { name: 'James Lee', seed: 'JamesLee' },
                { name: 'Sofia Rodriguez', seed: 'SofiaRodriguez' },
                { name: 'Aisha Khan', seed: 'AishaKhan' },
                { name: 'Lucas Silva', seed: 'LucasSilva' }
            ];

            // Conversation templates (questions and answers)
            const CONVERSATIONS = [
                {
                    question: "Has anyone tried the Figma plugin mentioned in the video?",
                    answer: "Yes! It's really helpful for creating design systems. Saves a lot of time!"
                },
                {
                    question: "I'm struggling with the user journey map. Any tips?",
                    answer: "Start with the user's goal and work backwards. Don't forget to include pain points!"
                },
                {
                    question: "What's the best way to conduct user interviews remotely?",
                    answer: "I use Zoom with screen sharing. Make sure to record with permission for later analysis."
                },
                {
                    question: "Does anyone have examples of good empathy maps?",
                    answer: "Check out Nielsen Norman Group's website. They have great templates and examples."
                },
                {
                    question: "How many iterations should I do for wireframes?",
                    answer: "Usually 3-5 iterations. Keep iterating until you solve the main user problems."
                },
                {
                    question: "Is it worth learning Adobe XD or should I stick with Figma?",
                    answer: "Figma is more popular now and cloud-based. I'd recommend focusing on Figma."
                },
                {
                    question: "The accessibility guidelines seem overwhelming. Where should I start?",
                    answer: "Start with color contrast and keyboard navigation. WCAG 2.1 Level AA is a good baseline."
                },
                {
                    question: "How do you handle stakeholders who don't understand UX?",
                    answer: "Show them data! User testing results and metrics usually convince them."
                }
            ];

            const SINGLE_MESSAGES = [
                "This course is so well structured! 👍",
                "Taking notes on everything. So much valuable information!",
                "Can't wait to apply this to my portfolio project.",
                "The examples in this module are really practical.",
                "Anyone else planning to take the Figma certification after this?",
                "Just got my first UX job offer! This course helped so much.",
                "The instructor explains things so clearly.",
                "I'm rewatching this section. So many insights!"
            ];

            const generateMessage = () => {
                const random = Math.random();

                // 60% chance of Q&A conversation, 40% chance of single message
                if (random < 0.6) {
                    // Generate a Q&A pair
                    const conversation = CONVERSATIONS[Math.floor(Math.random() * CONVERSATIONS.length)];
                    const asker = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
                    const answerer = STUDENTS.filter(s => s.name !== asker.name)[Math.floor(Math.random() * (STUDENTS.length - 1))];

                    // Add question
                    const questionMsg = {
                        _id: `auto-${Date.now()}-q`,
                        courseId,
                        userId: `auto-${asker.seed}`,
                        username: asker.name,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${asker.seed}`,
                        text: conversation.question,
                        timestamp: new Date().toISOString(),
                        isAutoGenerated: true
                    };

                    setMessages(prev => [...prev, questionMsg]);

                    // Add answer after 3-8 seconds
                    setTimeout(() => {
                        const answerMsg = {
                            _id: `auto-${Date.now()}-a`,
                            courseId,
                            userId: `auto-${answerer.seed}`,
                            username: answerer.name,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${answerer.seed}`,
                            text: conversation.answer,
                            timestamp: new Date().toISOString(),
                            isAutoGenerated: true
                        };
                        setMessages(prev => [...prev, answerMsg]);
                    }, Math.random() * 5000 + 3000); // 3-8 seconds

                } else {
                    // Generate single message
                    const student = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
                    const message = SINGLE_MESSAGES[Math.floor(Math.random() * SINGLE_MESSAGES.length)];

                    const msg = {
                        _id: `auto-${Date.now()}`,
                        courseId,
                        userId: `auto-${student.seed}`,
                        username: student.name,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.seed}`,
                        text: message,
                        timestamp: new Date().toISOString(),
                        isAutoGenerated: true
                    };

                    setMessages(prev => [...prev, msg]);
                }
            };

            // Generate first message after 10 seconds
            const firstTimeout = setTimeout(generateMessage, 10000);

            // Then generate messages every 20-40 seconds
            const interval = setInterval(() => {
                generateMessage();
            }, Math.random() * 20000 + 20000); // 20-40 seconds

            return () => {
                clearTimeout(firstTimeout);
                clearInterval(interval);
            };
        }, [activeTab, courseId]);

        const handleSendMessage = async () => {
            if (!chatInput.trim() || !user) return;

            const tempId = Date.now();
            // Optimistic UI update
            const tempMsg = {
                _id: tempId,
                isTemp: true, // Mark as temp
                courseId,
                userId: user._id || user.username || 'temp',
                username: user.username,
                avatar: user.avatar,
                text: chatInput,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, tempMsg]);
            setChatInput('');

            // Force scroll
            setTimeout(scrollToBottom, 50);

            try {
                await axios.post(`${API_URL}/api/messages`, {
                    courseId,
                    userId: user._id || user.username || 'unknown',
                    username: user.username,
                    avatar: user.avatar,
                    text: tempMsg.text
                });
            } catch (error) {
                console.error("Send message error:", error);
            }
        };


        const handleSaveNote = () => {
            if (!noteInput.trim()) return;
            const newNote = {
                id: Date.now(),
                text: noteInput,
                time: currentTime,
                date: new Date().toLocaleDateString()
            };
            setSavedNotes([newNote, ...savedNotes]);
            setNoteInput('');
        };

        // --- TRANSCRIPT ---
        const transcriptSegments = [
            { start: 0, end: 15, text: "[Intro] Welcome to the Google UX Design course! I am very happy to accompany you." },
            { start: 15, end: 30, text: "In this course, we will learn the foundations of User Experience Design." },
            { start: 30, end: 45, text: "You will learn how to empathize with users, define problems, and come up with creative solutions." },
            { start: 45, end: 60, text: "We will go through concepts like Wireframing, Prototyping, and Testing." },
            { start: 60, end: 75, text: "These are essential skills that every UX Designer at Google uses daily." },
            { start: 75, end: 90, text: "Let's start by looking at the curriculum and the projects you will be working on soon." },
            { start: 90, end: 9999, text: "[End of preview]" }
        ];

        const handleTimeUpdate = () => {
            if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
            }
        };

        const handleJumpToTime = (time) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
                videoRef.current.play();
            }
        };

        // --- PROGRESS BAR CALCS ---
        const allItems = modules.flatMap(m => m.items);
        const completedCount = allItems.filter(i => i.completed).length;
        const totalItemsCount = allItems.length;
        const progressPercentage = (completedCount / totalItemsCount) * 100;

        return (
            <div className="flex flex-col h-screen bg-white text-gray-900">
                {/* 1. Learning Header */}
                <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 bg-white z-50">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="https://images.ctfassets.net/00atxywtfxvd/2QeS5ysKMhZ3ZjiU2rGRJA/e15df94b265053ce8ded4f5e630241c8/cropped-android-chrome-512x512-1.png" alt="Coursera" className="w-8" />
                            <span className="text-blue-600 font-bold text-xl hidden md:block">coursera</span>
                        </Link>
                        <span className="text-gray-300 text-2xl font-light">|</span>
                        <div className="flex items-center gap-2">
                            <img src={COURSE_METADATA[courseId]?.logo || COURSE_METADATA['1'].logo} alt="Organization" className="h-5" />
                        </div>
                    </div>

                    {/* Progress Center */}
                    <div className="hidden md:flex flex-col items-center flex-1 mx-8 max-w-xl">
                        <div className="flex items-center justify-between w-full text-xs text-gray-500 mb-1">
                            <span className="font-semibold">{completedCount}/{totalItemsCount} learning items</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#137333] transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600">
                        {/* Sync Status Indicator */}
                        {syncStatus === 'syncing' && (
                            <span className="text-xs text-blue-600 font-medium animate-pulse flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Saving...
                            </span>
                        )}
                        {syncStatus === 'saved' && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1 transition-opacity duration-500">
                                <CheckCircle size={12} /> Saved to Cloud
                            </span>
                        )}
                        {syncStatus === 'error' && (
                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <AlertCircle size={12} /> Save Failed
                            </span>
                        )}


                        <div className="hidden md:flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className="focus:outline-none transform hover:scale-110 transition-transform"
                                >
                                    <Star
                                        size={16}
                                        className={`${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} transition-colors duration-200`}
                                    />
                                </button>
                            ))}
                            <span className="ml-1 text-xs text-gray-600 font-medium">{userRating > 0 ? userRating : ''}</span>
                        </div>

                        <Globe size={20} className="hidden sm:block cursor-pointer" />
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer">
                            D
                        </div>
                    </div>
                </header >

                <div className="flex flex-1 overflow-hidden">
                    {/* 2. Sidebar */}
                    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} relative overflow-hidden`}>
                        {/* Course Title Header */}
                        <div className="p-4 border-b border-gray-200 flex items-start justify-between bg-white z-10 sticky top-0">
                            <div>
                                <h2 className="font-bold text-[#1967d2] text-sm leading-tight mb-0.5">{COURSE_METADATA[courseId]?.title || COURSE_METADATA['1'].title}</h2>
                            </div>
                            <button onClick={() => setActiveLessonId(null)} className="text-gray-400 hover:text-gray-700 p-1">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Module List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto">
                            {modules.map((module) => (
                                <div key={module.id} className="border-b border-gray-100">
                                    {/* Module Header (Click to Toggle) */}
                                    <div
                                        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wide mb-1">Module {module.id}</div>
                                            <h3 className="text-sm font-bold text-gray-800 leading-tight">{module.subtitle || module.title}</h3>
                                        </div>
                                        <div className="text-gray-400 mt-1">
                                            {expandedModules[module.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {/* Module Items (Collapsible) */}
                                    {expandedModules[module.id] && (
                                        <div className="pb-2">
                                            {module.items.length === 0 ? (
                                                <div className="px-4 py-2 text-xs text-gray-400 italic">No content available yet.</div>
                                            ) : (
                                                module.items.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => { setActiveLessonId(item.id); setQuizStarted(false); }}
                                                        className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeLessonId === item.id ? 'bg-[#e8f0fe] border-l-4 border-[#1967d2]' : 'border-l-4 border-transparent'}`}
                                                    >
                                                        <div className="flex flex-col items-center pt-1">
                                                            {/* Status Icon */}
                                                            {item.completed ? (
                                                                <CheckCircle size={16} className="text-[#137333] fill-[#e6f4ea]" />
                                                            ) : (
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeLessonId === item.id ? 'border-[#1967d2] bg-[#1967d2]' : 'border-gray-300 bg-white'}`}>
                                                                    {activeLessonId === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-medium mb-0.5 leading-snug ${activeLessonId === item.id ? 'text-[#1967d2]' : 'text-gray-900'}`}>{item.title}</div>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                                {item.type === 'video' && <Video size={12} />}
                                                                {item.type === 'reading' && <BookOpen size={12} />}
                                                                {item.type === 'assignment' && <HelpCircle size={12} />}
                                                                {item.type === 'plugin' && <span>&lt;&gt;</span>}
                                                                <span>{item.type === 'plugin' ? 'Ungraded Plugin' : (item.type.charAt(0).toUpperCase() + item.type.slice(1))}</span>
                                                                <span>•</span>
                                                                <span>{item.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Toggle Button for Learning Mode */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`absolute top-1/2 z-30 p-1 bg-white shadow-lg border border-gray-200 rounded-r-lg transform -translate-y-1/2 transition-all duration-300 ${sidebarOpen ? 'left-80' : 'left-0'}`}
                    >
                        {sidebarOpen ? <ArrowLeft size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* 3. Main Content Area */}
                    <main className="flex-1 overflow-hidden bg-white">
                        <div className={`h-full flex flex-col ${activeTab === 'discuss' ? 'lg:flex-row' : ''}`}>

                            {/* LEFT/TOP PANE: Video & Tabs */}
                            <div className={`flex-1 flex flex-col overflow-y-auto ${activeTab === 'discuss' ? 'lg:border-r border-gray-200' : ''}`}>
                                <div className={`w-full max-w-5xl mx-auto p-4 md:p-8 ${activeTab === 'discuss' ? 'mx-0 max-w-none' : ''}`}>

                                    {/* CONDITIONAL CONTENT RENDERING */}
                                    {currentLesson?.type === 'reading' && <ReadingView data={currentLesson} />}
                                    {currentLesson?.type === 'assignment' && <AssignmentView data={currentLesson} />}

                                    {currentLesson?.type === 'video' && (
                                        <>
                                            <div className="mb-6">
                                                <YouTubePlayer
                                                    url={currentLesson.src}
                                                    title={currentLesson.title}
                                                />
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                                                <h1 className="text-2xl font-bold text-gray-900 flex-1">{currentLesson?.title}</h1>
                                                <div className="flex gap-3">
                                                    <button className="flex items-center gap-1 text-[#1967d2] font-bold text-sm px-4 py-2 rounded border border-[#1967d2] hover:bg-blue-50">
                                                        <Edit3 size={16} /> Save note
                                                    </button>
                                                    <button
                                                        onClick={handleNextItem}
                                                        className="flex items-center gap-1 text-[#1967d2] font-bold text-sm px-4 py-2 rounded bg-white border border-[#1967d2] hover:bg-blue-50"
                                                    >
                                                        Go to next item <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Video Tabs */}
                                            <div className="mt-8">
                                                <div className="flex gap-8 border-b border-gray-200 mb-6">
                                                    {['Transcript', 'Notes', 'Downloads', 'Discuss'].map((tab) => (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setActiveTab(tab.toLowerCase())}
                                                            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === tab.toLowerCase() ? 'border-[#1967d2] text-[#1967d2]' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                                                        >
                                                            {tab}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Tab Content (Non-Chat) */}
                                                {activeTab !== 'discuss' && (
                                                    <div className="min-h-[200px] text-gray-700 leading-relaxed max-w-3xl">
                                                        {activeTab === 'transcript' && (
                                                            <div className="space-y-4 font-mono text-sm max-h-[400px] overflow-y-auto pr-2">
                                                                {transcriptSegments.map((segment, idx) => {
                                                                    const isActive = currentTime >= segment.start && currentTime < segment.end;
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`p-3 rounded-lg transition-all cursor-pointer ${isActive ? 'bg-[#e8f0fe] border-l-4 border-[#1967d2] pl-3' : 'hover:bg-gray-50 border-l-4 border-transparent pl-3'}`}
                                                                            onClick={() => handleJumpToTime(segment.start)}
                                                                        >
                                                                            <span className={`font-bold mr-4 inline-block w-12 text-right ${isActive ? 'text-[#1967d2]' : 'text-[#1967d2]'}`}>
                                                                                {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')}
                                                                            </span>
                                                                            <span className={isActive ? 'font-medium text-gray-900' : 'text-gray-600'}>
                                                                                {segment.text}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {activeTab === 'notes' && (
                                                            <div className="animate-fade-in">
                                                                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Add a note at {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</label>
                                                                    <textarea
                                                                        value={noteInput}
                                                                        onChange={(e) => setNoteInput(e.target.value)}
                                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1967d2] focus:border-transparent outline-none text-sm"
                                                                        rows="3"
                                                                        placeholder="Type your note here..."
                                                                    ></textarea>
                                                                    <div className="flex justify-end mt-2">
                                                                        <button
                                                                            onClick={handleSaveNote}
                                                                            className="bg-[#1967d2] text-white text-sm font-bold px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                                                        >
                                                                            Save Note
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    {savedNotes.length === 0 ? (
                                                                        <div className="text-center text-gray-500 py-8">
                                                                            <Edit3 size={32} className="mx-auto mb-2 opacity-50" />
                                                                            <p>No notes yet. Start watching and take notes!</p>
                                                                        </div>
                                                                    ) : (
                                                                        savedNotes.map((note) => (
                                                                            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <span
                                                                                        onClick={() => handleJumpToTime(note.time)}
                                                                                        className="text-[#1967d2] font-bold text-xs cursor-pointer hover:underline bg-blue-50 px-2 py-1 rounded"
                                                                                    >
                                                                                        {Math.floor(note.time / 60)}:{(Math.floor(note.time % 60)).toString().padStart(2, '0')}
                                                                                    </span>
                                                                                    <span className="text-xs text-gray-400">{note.date}</span>
                                                                                </div>
                                                                                <p className="text-gray-800 text-sm">{note.text}</p>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {activeTab === 'downloads' && (
                                                            <div className="animate-fade-in space-y-4">
                                                                <a href="/lecture_slides.pdf" download="Google_UX_Design_Module1_Slides.pdf" className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-[#1967d2] cursor-pointer group transition-colors block decoration-0">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="bg-red-50 p-3 rounded-lg text-red-600 group-hover:bg-red-100 transition-colors">
                                                                            <FileText size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-gray-900 text-sm">Lecture Slides</h4>
                                                                            <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
                                                                        </div>
                                                                    </div>
                                                                    <Download size={20} className="text-gray-400 group-hover:text-[#1967d2]" />
                                                                </a>

                                                                <a href="/sample_transcript.txt" download="Lecture_Transcript.txt" className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-[#1967d2] cursor-pointer group transition-colors block decoration-0">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                                            <File size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-gray-900 text-sm">Transcript (English)</h4>
                                                                            <p className="text-xs text-gray-500">TXT • 15 KB</p>
                                                                        </div>
                                                                    </div>
                                                                    <Download size={20} className="text-gray-400 group-hover:text-[#1967d2]" />
                                                                </a>

                                                                <a href={currentLesson.src} download={`Lesson_Video_${currentLesson.id}.mp4`} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-[#1967d2] cursor-pointer group transition-colors block decoration-0">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="bg-green-50 p-3 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                                                            <Video size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-gray-900 text-sm">Mobile Optimized Video</h4>
                                                                            <p className="text-xs text-gray-500">MP4 • 48 MB</p>
                                                                        </div>
                                                                    </div>
                                                                    <Download size={20} className="text-gray-400 group-hover:text-[#1967d2]" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT PANE: Chat Sidebar (Only visible when Discuss tab is active) */}
                            {activeTab === 'discuss' && (
                                <div className="w-full lg:w-96 flex flex-col bg-white border-l border-gray-200 lg:h-auto h-[600px] animate-slide-in-right">
                                    {/* Chat Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Live Chat</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex -space-x-1">
                                                    <img
                                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen"
                                                        alt="Sarah"
                                                        className="w-5 h-5 rounded-full border-2 border-white"
                                                    />
                                                    <img
                                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMartinez"
                                                        alt="Alex"
                                                        className="w-5 h-5 rounded-full border-2 border-white"
                                                    />
                                                    <img
                                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=MinhNguyen"
                                                        alt="Minh"
                                                        className="w-5 h-5 rounded-full border-2 border-white"
                                                    />
                                                </div>
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    {(Math.floor(Math.random() * 50) + 120)} online
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={chatContainerRef}>
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-80">
                                                <MessageSquare size={48} className="mb-2" />
                                                <p className="text-sm">Welcome to the discussion!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => (
                                                <div key={msg._id || msg.id} className={`flex gap-3 ${msg.username === user?.username ? 'flex-row-reverse' : ''}`}>
                                                    <img
                                                        src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`}
                                                        alt={msg.username}
                                                        className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex-shrink-0"
                                                    />
                                                    <div className={`max-w-[85%] ${msg.username === user?.username ? 'items-end' : 'items-start'}`}>
                                                        <div className="flex items-baseline gap-2 mb-1 px-1">
                                                            <span className="text-xs font-bold text-gray-700">{msg.username}</span>
                                                            <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className={`p-3 rounded-lg text-sm shadow-sm break-words ${msg.username === user?.username ? 'bg-[#1967d2] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                                            {msg.text}
                                                        </div>
                                                        {/* Removed bot label - all users appear as peers */}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Chat Input */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="bg-white p-4 border-t border-gray-200"
                                    >
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder={user ? "Type a message..." : "Login to chat"}
                                                disabled={!user}
                                                className="w-full border border-gray-300 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#1967d2] focus:ring-1 focus:ring-[#1967d2] transition-colors"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!user || !chatInput.trim()}
                                                className="absolute right-2 top-2 bg-[#1967d2] text-white p-1.5 rounded-full hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div >
        );
    }


    // --- MODE 2: OVERVIEW MODE (Dashboard View) ---
    // (This matches the previous "Home" state of the interface)

    // Components reused from previous implementation but simplified for brevity in this file
    const OverviewView = () => {
        // Calculate dynamic stats
        const allItems = modules.flatMap(m => m.items);

        const videoMinutesLeft = allItems
            .filter(i => i.type === 'video' && !i.completed)
            .reduce((acc, i) => acc + parseInt(i.duration || '0'), 0);

        const readingMinutesLeft = allItems
            .filter(i => i.type === 'reading' && !i.completed)
            .reduce((acc, i) => acc + parseInt(i.duration || '0'), 0);

        const assessmentsLeft = allItems
            .filter(i => i.type === 'assignment' && !i.completed)
            .length;

        const currentViewModule = modules.find(m => m.id === activeModuleId) || modules[0];

        return (
            <div className="max-w-4xl mx-auto">
                {/* Header with Reset Button */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {COURSE_METADATA[courseId]?.title || "Course Overview"}
                    </h1>
                    <button
                        onClick={handleResetProgress}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <AlertCircle size={18} />
                        Reset Progress
                    </button>
                </div>

                {/* Stats Header */}
                <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm">
                    <button className="flex items-center gap-2 font-bold text-gray-800 mb-4 hover:underline">
                        <ChevronDown size={20} /> {modules[0]?.subtitle || "Course Overview"}
                    </button>
                    <div className="flex flex-wrap gap-6 text-xs font-semibold text-gray-600 uppercase tracking-wide mb-6 pl-6">
                        <span className={`flex items-center gap-1.5 ${videoMinutesLeft === 0 ? 'text-green-600' : ''}`}>
                            <Video size={16} className={videoMinutesLeft === 0 ? 'text-green-600' : 'text-gray-400'} />
                            {videoMinutesLeft > 0 ? `${videoMinutesLeft} min of videos left` : 'All videos completed'}
                        </span>
                        <span className={`flex items-center gap-1.5 ${readingMinutesLeft === 0 ? 'text-green-600' : ''}`}>
                            <FileText size={16} className={readingMinutesLeft === 0 ? 'text-green-600' : 'text-gray-400'} />
                            {readingMinutesLeft > 0 ? `${readingMinutesLeft} min of readings left` : 'All readings completed'}
                        </span>
                        <span className={`flex items-center gap-1.5 ${assessmentsLeft === 0 ? 'text-green-600' : ''}`}>
                            <CheckCircle size={16} className={assessmentsLeft === 0 ? 'text-green-600' : 'text-gray-400'} />
                            {assessmentsLeft > 0 ? `${assessmentsLeft} graded assessment left` : 'All assessments completed'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4 pl-6">
                        <p>{modules[0]?.items?.find(i => i.type === 'reading')?.content?.intro || "Welcome to the course. Please complete the modules below."}</p>
                    </div>
                </div>

                {/* Main List */}
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 px-2">
                        <ChevronDown size={20} /> {currentViewModule.subtitle || currentViewModule.title}
                    </h3>
                    <div className="bg-white border-t border-gray-200">
                        {currentViewModule.items.map((item, idx) => (
                            <div key={item.id} onClick={() => setActiveLessonId(item.id)} className="flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group">
                                <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${item.completed ? 'bg-green-100 text-[#137333]' : 'bg-gray-100 text-gray-600 group-hover:bg-[#e8f0fe] group-hover:text-[#1967d2]'}`}>
                                    {item.completed ? (
                                        <CheckCircle size={20} className="fill-[#e6f4ea]" />
                                    ) : (
                                        item.type === 'video' ? <Play size={20} fill="currentColor" className="opacity-80" /> :
                                            item.type === 'assignment' ? <HelpCircle size={20} className="opacity-80" /> :
                                                <BookOpen size={20} className="opacity-80" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-[15px] font-semibold ${item.completed ? 'text-gray-500' : 'text-gray-900'} group-hover:text-[#1967d2]`}>{item.title}</h4>
                                        {item.completed && <span className="text-xs font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded ml-2">Completed</span>}
                                        {item.grade && <span className="text-xs font-bold text-[#1967d2] bg-[#e8f0fe] px-2 py-0.5 rounded ml-2">Grade: {item.grade}</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 capitalize">{item.type} • {item.duration}</div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveLessonId(item.id);
                                    }}
                                    className={`text-sm font-bold px-5 py-2 rounded transition-colors shadow-sm whitespace-nowrap ml-4 ${item.completed
                                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        : 'bg-[#1967d2] hover:bg-[#1557b0] text-white'
                                        }`}
                                >
                                    {item.completed ? 'Review' : 'Start'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // --- New Sections ---

    const GradesView = () => {
        const assignments = modules.flatMap(m => m.items).filter(i => i.type === 'assignment');

        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Grades</h1>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Item</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Due Date</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {assignments.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                                    <td className="px-6 py-4">
                                        {item.completed ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Completed</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">To do</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">Dec 15, 2025</td>
                                    <td className="px-6 py-4 text-gray-500 font-bold">{item.grade || '--'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ... Notes, Messages, Resources, Info ...
    const NotesView = () => (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Notes</h1>
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <Edit3 size={48} className="mx-auto mb-4 text-gray-300" />
                <p>You haven't created any notes yet.</p>
                <p className="text-sm">Notes you take during lessons will appear here.</p>
            </div>
        </div>
    );

    const MessagesView = () => (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
            <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">Welcome to the Course!</h3>
                        <span className="text-xs text-gray-500">Dec 6</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Hi everyone, I'm Toni, your instructor. I'm excited to start this journey with you all. Please check the syllabus for more info.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">Week 1 Office Hours</h3>
                        <span className="text-xs text-gray-500">Dec 5</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Join us for office hours this Friday to discuss the first module's challenge.</p>
                </div>
            </div>
        </div>
    );

    const ResourcesView = () => (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Resources</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:border-blue-500 cursor-pointer bg-white">
                    <div className="bg-red-50 p-3 rounded-lg text-red-600"><FileText size={24} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">Course Syllabus</h4>
                        <p className="text-xs text-gray-500">PDF • 1.2 MB</p>
                    </div>
                    <Download size={16} className="ml-auto text-gray-400" />
                </div>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:border-blue-500 cursor-pointer bg-white">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><FileText size={24} /></div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">UX Design Glossary</h4>
                        <p className="text-xs text-gray-500">PDF • 2.5 MB</p>
                    </div>
                    <Download size={16} className="ml-auto text-gray-400" />
                </div>
            </div>
        </div>
    );

    const CourseInfoView = () => (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Course Info</h1>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">About the Course</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    This is the first course in the Google UX Design Certificate. These courses will equip you with the skills you need to apply for entry-level jobs in user experience design.
                </p>
                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                        <span className="block text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">Instructor</span>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <span className="font-medium">Toni</span>
                        </div>
                    </div>
                    <div>
                        <span className="block text-gray-500 text-xs uppercase font-bold tracking-wide mb-1">Level</span>
                        <span className="font-medium">Beginner</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const MainContent = () => {
        switch (activeSection) {
            case 'grades': return <GradesView />;
            case 'notes': return <NotesView />;
            case 'messages': return <MessagesView />;
            case 'resources': return <ResourcesView />;
            case 'info': return <CourseInfoView />;
            case 'course_material':
            default:
                return activeLessonId ? <LearningMode /> : <OverviewView />;
        }
    };

    // Render Logic
    if (activeLessonId) {
        return <LearningMode />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900 overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar (Overview Mode) */}
                <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-gray-200 flex flex-col bg-white h-full relative z-20`}>
                    <div className="p-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-6 mb-3" />
                        <h2 className="font-bold text-base leading-tight">Foundations of User Experience (UX) Design</h2>
                        <p className="text-xs text-gray-500 mt-1">Google</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <button
                            onClick={() => setActiveSection('course_material')}
                            className={`w-full flex items-center justify-between px-6 py-2 text-sm font-bold border-l-4 transition-colors ${activeSection === 'course_material' ? 'bg-gray-50 text-gray-900 border-[#1967d2]' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}
                        >
                            <span className="flex items-center gap-2"><ChevronDown size={18} /> Course Material</span>
                        </button>

                        {activeSection === 'course_material' && (
                            <div className="mt-2 text-sm">
                                {modules.map(m => {
                                    // Check if all items in module are completed
                                    const isCompleted = m.items.every(item => item.completed);

                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setActiveModuleId(m.id)}
                                            className={`w-full flex items-center gap-3 px-6 py-4 font-medium hover:bg-gray-50 relative ${activeModuleId === m.id ? 'bg-[#e8f0fe] text-[#1967d2]' : 'text-gray-600'}`}
                                        >
                                            {activeModuleId === m.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1967d2]"></div>}
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCompleted ? 'bg-[#137333] border-[#137333]' : activeModuleId === m.id ? 'border-[#1967d2]' : 'border-gray-400'}`}>
                                                {isCompleted && <CheckCircle size={14} className="text-white" fill="currentColor" />}
                                            </div>
                                            <span>{m.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* More Menu Items... */}
                        <div className="mt-6 space-y-1 px-2">
                            {[
                                { id: 'grades', label: 'Grades' },
                                { id: 'notes', label: 'Notes' },
                                { id: 'messages', label: 'Messages' },
                                { id: 'resources', label: 'Resources' },
                                { id: 'info', label: 'Course Info' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`block w-full text-left px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${activeSection === item.id ? 'bg-[#e8f0fe] text-[#1967d2]' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Mobile Toggle */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-20 left-4 z-30 p-2 bg-white rounded-md shadow-md border border-gray-200 md:hidden">
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>


                <main className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12">
                        <MainContent />
                    </div>
                </main>

                {/* Right Sidebar (Overview Mode) */}
                {activeSection === 'course_material' && !activeLessonId && (
                    <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto h-full">
                        {learningPlan ? (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">Your Learning Plan</h3>
                                    <button onClick={() => setShowPlanModal(true)} className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase">Weekly Goal</div>
                                            <div className="font-bold text-gray-900">{learningPlan.daysPerWeek} days a week</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 font-bold uppercase">Daily Goal</div>
                                            <div className="font-bold text-gray-900">{learningPlan.minutesPerDay} mins per day</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-gray-600">Weekly Progress</span>
                                        <span className="font-bold text-blue-600">1/{learningPlan.daysPerWeek} days</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(1 / learningPlan.daysPerWeek) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm sticky top-8">
                                <h3 className="font-bold text-gray-900 mb-2">Learning plan</h3>
                                <p className="text-xs text-gray-600 mb-4">Learners with a plan are 75% more likely to complete their courses. Set learning plan now!</p>
                                <button
                                    onClick={() => setShowPlanModal(true)}
                                    className="w-full bg-white border border-[#1967d2] text-[#1967d2] text-sm font-bold py-2 rounded hover:bg-[#e8f0fe]"
                                >
                                    Set your learning plan
                                </button>
                            </div>
                        )}
                    </aside>
                )}

                {/* MODAL */}
                {showPlanModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Set your learning goal</h2>
                            <p className="text-sm text-gray-600 mb-6">How much time can you spend learning each week?</p>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const days = e.target.days.value;
                                const mins = e.target.mins.value;
                                handleSavePlan({ daysPerWeek: days, minutesPerDay: mins });
                            }}>
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Days per week</label>
                                        <select name="days" defaultValue={learningPlan?.daysPerWeek || "3"} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                                            <option value="1">1 day</option>
                                            <option value="2">2 days</option>
                                            <option value="3">3 days (Recommended)</option>
                                            <option value="4">4 days</option>
                                            <option value="5">5 days</option>
                                            <option value="6">6 days</option>
                                            <option value="7">7 days</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Minutes per day</label>
                                        <select name="mins" defaultValue={learningPlan?.minutesPerDay || "30"} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500">
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes (Recommended)</option>
                                            <option value="60">60 minutes</option>
                                            <option value="90">90 minutes</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowPlanModal(false)}
                                        className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#1967d2] text-white font-bold rounded-lg hover:bg-[#1557b0]"
                                    >
                                        Save Plan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reset Confirmation Modal */}
                {showResetModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} className="text-red-600" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                                Reset All Progress?
                            </h2>

                            {/* Message */}
                            <p className="text-sm text-gray-600 text-center mb-6">
                                This will mark all lessons as incomplete and remove all grades.
                                This action cannot be undone.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReset}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reset Progress
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Notification */}
                {resetSuccess && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in">
                        <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                            <CheckCircle size={20} />
                            <span className="font-semibold">Progress reset successfully!</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningInterface;
