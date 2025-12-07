import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Award, Target, Star, ArrowRight, CheckCircle, Bot } from 'lucide-react';
import Header from '../components/Header';
import { useChat } from '../context/ChatContext';

const MyLearning = () => {
    const navigate = useNavigate();
    const { openChatWithMessage } = useChat();

    // Handle Explore with AI button
    const handleExploreWithAI = () => {
        const message = "Based on my learning progress, I've mastered analytical and creative skills in Data Analysis, Communication, and Storytelling. Can you recommend advanced courses that combine these skills for real-world projects and portfolio-building?";
        openChatWithMessage(message);
    };

    // Mock data based on wireframes
    const progressData = {
        percentage: 68,
        completedCourses: 7,
        inProgressCourses: 2,
        remainingLessons: 10,
        weeklyGrowth: 12
    };

    const skills = [
        { name: 'Data Analysis', level: 85, rating: 'Excellent', color: '#1967d2' },
        { name: 'Communication', level: 72, rating: 'Good', color: '#34a853' },
        { name: 'Statistical Analysis', level: 64, rating: 'Good', color: '#fbbc04' },
        { name: 'Problem Solving', level: 50, rating: 'Average', color: '#ea4335' },
        { name: 'Machine Learning', level: 40, rating: 'Needs Improvement', color: '#9aa0a6' }
    ];

    const completedCourses = [
        { id: 1, title: 'Applied Machine Learning with Python', progress: 100 },
        { id: 2, title: 'Advanced Data Storytelling with Tableau and Power BI', progress: 100 },
        { id: 3, title: 'UX/UI Design Foundations for Digital Products', progress: 100 }
    ];

    const inProgressCourses = [
        { id: 1, title: 'Project Planning: Putting It All Together', courseNum: 2, totalCourses: 8, progress: 30 },
        { id: 2, title: 'Statistical Techniques in Tableau', courseNum: 6, totalCourses: 10, progress: 60 }
    ];

    const skillDetails = [
        {
            name: 'Data Analysis',
            level: 72,
            rating: 'Excellent',
            lastActivity: 'Improved through course Applied Machine Learning with Python',
            nextStep: 'Experts in Deep Learning and Data Storytelling',
            color: '#1967d2'
        },
        {
            name: 'Communication',
            level: 64,
            rating: 'Good',
            lastActivity: 'Enhanced through Effective Communication and Leadership Workshop',
            nextStep: 'Practice cross-functional collaboration through Team Communication Strategies',
            color: '#34a853'
        },
        {
            name: 'Statistical Analysis',
            level: 64,
            rating: 'Good',
            lastActivity: 'Refined through Data Analytics Fundamentals',
            nextStep: 'Gained experience through Applied Machine Learning with Python',
            color: '#fbbc04'
        },
        {
            name: 'Machine Learning',
            level: 40,
            rating: 'Needs Improvement',
            lastActivity: 'Gained experience through Applied Machine Learning with Python',
            nextStep: 'Deep Learning Specialization by Andrew Ng',
            color: '#ea4335'
        }
    ];

    // Circular progress component
    const CircularProgress = ({ percentage }) => {
        const circumference = 2 * Math.PI * 90;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative w-48 h-48 mx-auto">
                <svg className="transform -rotate-90 w-48 h-48">
                    {/* Background circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="90"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="90"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1967d2" />
                            <stop offset="100%" stopColor="#4285f4" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-gray-900">{percentage}%</span>
                </div>
            </div>
        );
    };

    // Radar chart component (simplified pentagon)
    const RadarChart = ({ skills }) => {
        const size = 200;
        const center = size / 2;
        const maxRadius = 80;

        // Calculate pentagon points
        const points = skills.map((skill, i) => {
            const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
            const radius = (skill.level / 100) * maxRadius;
            return {
                x: center + radius * Math.cos(angle),
                y: center + radius * Math.sin(angle)
            };
        });

        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

        return (
            <div className="relative w-full flex justify-center mb-6">
                <svg width={size} height={size} className="drop-shadow-md">
                    {/* Background pentagon */}
                    {[20, 40, 60, 80, 100].map((percent, idx) => {
                        const bgPoints = skills.map((_, i) => {
                            const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
                            const radius = (percent / 100) * maxRadius;
                            return {
                                x: center + radius * Math.cos(angle),
                                y: center + radius * Math.sin(angle)
                            };
                        });
                        const bgPath = bgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
                        return (
                            <path
                                key={idx}
                                d={bgPath}
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* Data pentagon */}
                    <path
                        d={pathData}
                        fill="rgba(25, 103, 210, 0.2)"
                        stroke="#1967d2"
                        strokeWidth="2"
                        className="animate-fade-in"
                    />

                    {/* Points */}
                    {points.map((point, i) => (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="#1967d2"
                            className="animate-fade-in"
                        />
                    ))}
                </svg>
            </div>
        );
    };

    // Line chart component for skill progress history
    const LineChart = () => {
        const width = 450;
        const height = 180;
        const padding = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Mock data for 4 skills over 8 weeks
        const skillData = [
            {
                name: 'Data Analysis',
                color: '#1967d2',
                values: [45, 48, 52, 58, 62, 68, 72, 75]
            },
            {
                name: 'Communication',
                color: '#34a853',
                values: [35, 38, 42, 48, 52, 58, 62, 64]
            },
            {
                name: 'Statistical Analysis',
                color: '#fbbc04',
                values: [40, 42, 45, 48, 52, 56, 60, 64]
            },
            {
                name: 'Machine Learning',
                color: '#ea4335',
                values: [25, 28, 30, 32, 34, 36, 38, 40]
            }
        ];

        const maxValue = 100;
        const points = 8;

        // Generate path for each skill
        const generatePath = (values) => {
            return values.map((value, i) => {
                const x = padding.left + (i / (points - 1)) * chartWidth;
                const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
        };

        return (
            <svg width={width} height={height} className="w-full">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((value, i) => {
                    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                    return (
                        <g key={i}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                            />
                            <text
                                x={padding.left - 10}
                                y={y + 4}
                                fontSize="10"
                                fill="#9ca3af"
                                textAnchor="end"
                            >
                                {value}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {Array.from({ length: points }).map((_, i) => {
                    const x = padding.left + (i / (points - 1)) * chartWidth;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 10}
                            fontSize="10"
                            fill="#9ca3af"
                            textAnchor="middle"
                        >
                            W{i + 1}
                        </text>
                    );
                })}

                {/* Lines for each skill */}
                {skillData.map((skill, idx) => (
                    <g key={idx}>
                        <path
                            d={generatePath(skill.values)}
                            fill="none"
                            stroke={skill.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        />
                        {/* Points on the line */}
                        {skill.values.map((value, i) => {
                            const x = padding.left + (i / (points - 1)) * chartWidth;
                            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill={skill.color}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${idx * 100 + i * 50}ms` }}
                                />
                            );
                        })}
                    </g>
                ))}

                {/* Legend */}
                <g transform={`translate(${padding.left}, ${height - 25})`}>
                    {skillData.map((skill, idx) => (
                        <g key={idx} transform={`translate(${idx * 110}, 0)`}>
                            <line
                                x1={0}
                                y1={0}
                                x2={15}
                                y2={0}
                                stroke={skill.color}
                                strokeWidth="2"
                            />
                            <text
                                x={20}
                                y={4}
                                fontSize="9"
                                fill="#6b7280"
                            >
                                {skill.name}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
                    <p className="text-gray-600">Track your progress and develop your skills</p>
                </div>

                {/* Section 1: Progress Overview & Skill Development */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Progress Overview */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                            <h2 className="text-xl font-bold text-gray-900">Progress Overview</h2>
                        </div>

                        <CircularProgress percentage={progressData.percentage} />

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Completed Courses</span>
                                <span className="text-sm font-bold text-gray-900">{progressData.completedCourses} Courses</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">In Progress</span>
                                <span className="text-sm font-bold text-gray-900">{progressData.inProgressCourses} Courses</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">Remaining Lessons</span>
                                <span className="text-sm font-bold text-gray-900">{progressData.remainingLessons} Lessons</span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <p className="text-sm font-bold text-gray-900 mb-1">
                                {progressData.percentage}% completed of your current program
                            </p>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <TrendingUp size={14} />
                                Up {progressData.weeklyGrowth}% from last week
                            </p>
                        </div>
                    </div>

                    {/* Skill Development */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                            <h2 className="text-xl font-bold text-gray-900">Skill Development</h2>
                        </div>

                        <RadarChart skills={skills} />

                        <div className="space-y-3">
                            {skills.map((skill, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                        <span className="text-sm font-bold text-gray-900">{skill.level}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${skill.level}%`,
                                                background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                            <Star className="text-blue-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-gray-700">
                                Your strongest skill is <span className="font-bold text-blue-600">Data Analysis</span>, showing consistent growth over the last 3 weeks.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Completed Lessons */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Lessons</h2>
                    <div className="space-y-4">
                        {completedCourses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">COURSE</p>
                                        <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-full border border-blue-200">
                                            {course.progress}%
                                        </span>
                                        <span className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                                            <Award size={16} />
                                            Accomplishment
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3: In Progress */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">In Progress</h2>
                    <div className="space-y-4">
                        {inProgressCourses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">COURSE</p>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                                        <p className="text-sm text-gray-600">Course {course.courseNum} of {course.totalCourses}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-full border border-blue-200">
                                            {course.progress}%
                                        </span>
                                        <button
                                            onClick={() => navigate('/learning/1')}
                                            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Resume
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 4: Skill Breakdown by Category */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Skill Breakdown by Category</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Skill Progress History */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Skill Progress History</h3>

                            {/* Line chart visualization */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-4 flex items-center justify-center">
                                <LineChart />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Average Weekly Improvement:</span>
                                    <span className="text-lg font-bold text-green-600">+6%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Most Improved Skill:</span>
                                    <span className="text-sm font-bold text-blue-600">Communication (+12%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Detailed Skill Analytics */}
                        <div>
                            <div className="space-y-4">
                                {skillDetails.map((skill, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-base font-bold text-gray-900">{skill.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">{skill.level}%</span>
                                                <span className={`px-2 py-1 text-xs font-bold rounded ${skill.rating === 'Excellent' ? 'bg-green-100 text-green-700' :
                                                    skill.rating === 'Good' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {skill.rating}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                                            <div
                                                className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${skill.level}%`,
                                                    backgroundColor: skill.color
                                                }}
                                            ></div>
                                        </div>

                                        <p className="text-xs text-gray-600 mb-2">
                                            <span className="font-medium">Last activity source:</span> {skill.lastActivity}
                                        </p>
                                        <a href="#" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                                            {skill.rating === 'Needs Improvement' ? 'Learn more:' : 'Next step:'} {skill.nextStep}
                                            <ArrowRight size={12} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Feedback Summary (AI Insight) */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback Summary (AI Insight)</h2>

                    {/* AI Insight Banner */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-6 text-white flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                            <Bot size={32} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-base leading-relaxed mb-3">
                                Great work! You've mastered both analytical and creative skills — now it's time to combine them to design smarter, data-informed experiences and real-world projects. You've reached an advanced level in analytics, storytelling, and design. Focusing on applied projects or portfolio-building will help you translate these skills into professional opportunities.
                            </p>
                            <button onClick={handleExploreWithAI} className="px-4 py-2 bg-white text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors">
                                Explore with AI
                            </button>
                        </div>
                    </div>

                    {/* Course Feedback Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                name: 'Applied Machine Learning with Python',
                                rating: 5,
                                feedback: 'You seem to excel in analytical thinking and data visualization. We recommend exploring Advanced Data Storytelling or Applied Machine Learning to strengthen your analytical depth.'
                            },
                            {
                                name: 'Data Visualization and Communication with AI Tools',
                                rating: 5,
                                feedback: "You've shown great creativity in using AI-assisted visualization tools; enhancing interactivity and accessibility will help you communicate data more effectively."
                            },
                            {
                                name: 'Advanced Data Storytelling with Tableau and Power BI',
                                rating: 5,
                                feedback: 'You\'ve built strong visualization and analytical storytelling skills; consider advancing toward predictive storytelling to bring deeper business insights.'
                            },
                            {
                                name: 'UX/UI Design Foundations for Digital Products',
                                rating: 5,
                                feedback: "You\'ve developed a strong sense of visual hierarchy and usability; exploring interaction design and user testing will help you create more intuitive experiences."
                            }
                        ].map((course, idx) => (
                            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Course Name:</p>
                                        <h4 className="text-sm font-bold text-gray-900 mb-2">{course.name}</h4>
                                        <div className="flex items-center gap-1 mb-2">
                                            <span className="text-xs text-gray-600 mr-1">Rating:</span>
                                            {Array.from({ length: course.rating }).map((_, i) => (
                                                <Star key={i} size={14} fill="#fbbc04" stroke="#fbbc04" />
                                            ))}
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <circle cx="10" cy="4" r="1.5" />
                                            <circle cx="10" cy="10" r="1.5" />
                                            <circle cx="10" cy="16" r="1.5" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    <span className="font-medium">Feedback:</span> {course.feedback}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 6: Next Recommended Course */}
                <div className="mb-8">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Next Recommended Course</h2>
                        <p className="text-gray-600 text-sm">Based on your learning patterns</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'AWS Certified Solutions Architect',
                                category: 'Design',
                                duration: '3 Month',
                                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
                                instructor: 'Lina',
                                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&amp;h=250&amp;fit=crop'
                            },
                            {
                                title: 'Data Manipulation with pandas',
                                category: 'Python',
                                duration: '1 Month',
                                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
                                instructor: 'Lina',
                                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&amp;h=250&amp;fit=crop'
                            },
                            {
                                title: 'SQL With AI',
                                category: 'SQL',
                                duration: '2 Month',
                                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
                                instructor: 'Lina',
                                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&amp;h=250&amp;fit=crop'
                            },
                            {
                                title: 'Containerization and Virtualization Concepts',
                                category: 'Docker',
                                duration: '1 Month',
                                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
                                instructor: 'Lina',
                                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&amp;h=250&amp;fit=crop'
                            }
                        ].map((course, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                                {/* Course Image */}
                                <div className="relative h-40 bg-gray-200 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded flex items-center gap-1">
                                            <BookOpen size={12} />
                                            {course.category}
                                        </span>
                                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
                                                <path d="M6 3v3l2 2" stroke="currentColor" strokeWidth="1" fill="none" />
                                            </svg>
                                            {course.duration}
                                        </span>
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="p-4">
                                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                        {course.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    {/* Instructor and Button */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {course.instructor.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">{course.instructor}</span>
                                        </div>
                                        <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                            Start
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyLearning;
