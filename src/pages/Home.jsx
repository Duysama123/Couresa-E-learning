import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { ArrowRight, Briefcase, Award, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Default mock data array
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    useEffect(() => {
        const checkEnrollments = () => {
            const courses = [];
            const KNOWN_COURSE_IDS = ['1'];

            KNOWN_COURSE_IDS.forEach(id => {
                // 1. Check for specific module data (primary persistence method now)
                const specificData = localStorage.getItem(`course_modules_data_${id}`);

                // 2. Fallback: Check if active via enrolled_course_info (for backward compat)
                const enrolledInfoRaw = localStorage.getItem('enrolled_course_info');
                let infoMatch = false;
                if (enrolledInfoRaw) {
                    try {
                        const info = JSON.parse(enrolledInfoRaw);
                        if (info.id === id) infoMatch = true;
                    } catch (e) { }
                }

                // If either exists, consider enrolled
                if (specificData || infoMatch) {
                    let modulesData = null;
                    let courseMeta = {};

                    // Load Data
                    if (specificData) {
                        try {
                            modulesData = JSON.parse(specificData);
                        } catch (e) { }
                    }

                    // Fallback to legacy data if id is 1 and no specific data
                    if (!modulesData && id === '1') {
                        const legacy = localStorage.getItem('course_modules_data');
                        if (legacy) try { modulesData = JSON.parse(legacy); } catch (e) { }
                    }

                    // Metadata mapping
                    const META = {
                        '1': { title: 'Google UX Design Professional Certificate', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' }
                    };

                    if (modulesData) {
                        const allItems = modulesData.flatMap(m => m.items);
                        const totalItems = allItems.length;
                        const completedItems = allItems.filter(i => i.completed).length;
                        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                        let currentMod = modulesData.find(m => m.items.some(i => !i.completed)) || modulesData[modulesData.length - 1];
                        let currentModIndex = modulesData.indexOf(currentMod) + 1;

                        courses.push({
                            id: id,
                            title: META[id].title,
                            logo: META[id].logo,
                            currentModule: currentMod ? (currentMod.subtitle || currentMod.title) : 'Course Overview',
                            progress: progressPercentage,
                            totalModules: modulesData.length,
                            currentModuleIndex: currentModIndex,
                            link: `/learning/${id}`
                        });
                    }
                }
            });

            setEnrolledCourses(courses);
        };

        checkEnrollments();
    }, []);

    const [careerGoal, setCareerGoal] = useState(() => {
        return localStorage.getItem('career_goal') || "Business Analysis";
    });
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(careerGoal);

    const handleSaveGoal = () => {
        setCareerGoal(tempGoal);
        localStorage.setItem('career_goal', tempGoal);
        setIsEditingGoal(false);
    };

    // Skills State
    const [skills, setSkills] = useState(() => {
        const saved = localStorage.getItem('user_skills');
        return saved ? JSON.parse(saved) : ["Data Analysis", "Project Management", "Critical Thinking"];
    });
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            const updatedSkills = [...skills, newSkill.trim()];
            setSkills(updatedSkills);
            setNewSkill("");
            localStorage.setItem('user_skills', JSON.stringify(updatedSkills));
        }
    };

    const handleRemoveSkill = (skillEndpoint) => {
        const updatedSkills = skills.filter(s => s !== skillEndpoint);
        setSkills(updatedSkills);
        localStorage.setItem('user_skills', JSON.stringify(updatedSkills));
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Header />

            {user ? (
                // LOGGED IN VIEW
                <main className="bg-gray-50 min-h-screen pb-16">
                    {/* Welcome / Continue Learning Section */}
                    <section className="container mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Continue learning</h1>
                            <Link to="/my-learning" className="text-blue-600 font-bold text-sm hover:underline">View all learning</Link>
                        </div>

                        {/* Course Progress Cards */}
                        <div className="space-y-4 mb-8">
                            {enrolledCourses.length > 0 ? (
                                enrolledCourses.map((course) => (
                                    <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src={course.logo} alt="Logo" className="w-6 h-6 object-contain" />
                                            <h2 className="font-bold text-gray-800">{course.title}</h2>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                            <div className="w-full md:w-2/3">
                                                <h3 className="text-lg font-semibold mb-1">{course.currentModule}</h3>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Course {course.currentModuleIndex} of {course.totalModules} • {course.progress}% complete
                                                </p>
                                                {/* Progress Bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(course.link)}
                                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                                            >
                                                Resume
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                                    No active courses. <Link to="/my-learning" className="text-blue-600 font-bold hover:underline">Start learning now!</Link>
                                </div>
                            )}
                        </div>

                        {/* Career Goal Banner */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            {isEditingGoal ? (
                                <div className="flex items-center gap-4 w-full">
                                    <select
                                        value={tempGoal}
                                        onChange={(e) => setTempGoal(e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                                        autoFocus
                                    >
                                        <option value="Business Analysis">Business Analysis</option>
                                        <option value="UX Designer">UX Designer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Project Manager">Project Manager</option>
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Digital Marketer">Digital Marketer</option>
                                        <option value="IT Support Specialist">IT Support Specialist</option>
                                        <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveGoal} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 text-sm">Save</button>
                                        <button onClick={() => { setIsEditingGoal(false); setTempGoal(careerGoal); }} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-md hover:bg-gray-300 text-sm">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-700 font-medium">
                                        Your career goal is to start a career as a <span className="font-bold">{careerGoal}</span>
                                    </p>
                                    <button onClick={() => { setIsEditingGoal(true); setTempGoal(careerGoal); }} className="text-blue-600 font-bold text-sm hover:underline">Edit goal</button>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Recommendations based on goal (Mock) */}
                    <section className="container mx-auto px-4 py-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Recommended for you</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    id: 1,
                                    title: "Business Analysis Fundamentals",
                                    org: "IBM",
                                    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
                                    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
                                    type: "Specialization"
                                },
                                {
                                    id: 2,
                                    title: "Introduction to Product Management",
                                    org: "Cognizant",
                                    logo: "https://logowik.com/content/uploads/images/cognizant-technology-solutions2780.jpg",
                                    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
                                    type: "Course"
                                },
                                {
                                    id: 3,
                                    title: "Agile Project Management",
                                    org: "Google",
                                    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png",
                                    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80",
                                    type: "Professional Certificate"
                                }
                            ].map((course) => (
                                <Link key={course.id} to={`/course/${course.id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block">
                                    <div className="h-40 bg-gray-100 relative">
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={course.logo} alt={course.org} className="w-4 h-4 object-contain" />
                                            <span className="text-xs font-bold text-gray-500">{course.org}</span>
                                        </div>
                                        <h3 className="font-bold text-md mb-1 line-clamp-2">{course.title}</h3>
                                        <p className="text-xs text-gray-500">{course.type}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Grow your skills Section */}
                    <section className="container mx-auto px-4 py-8">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Grow your skills</h2>
                            <button
                                onClick={() => setIsEditingSkills(!isEditingSkills)}
                                className="text-blue-600 font-bold text-sm hover:underline"
                            >
                                {isEditingSkills ? "Done" : "Edit skills"}
                            </button>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-2 mb-6 items-center">
                            <button className="px-4 py-1.5 bg-gray-600 text-white rounded-full text-sm font-bold">All</button>
                            {skills.map((skill, idx) => (
                                <div key={idx} className={`relative group ${isEditingSkills ? '' : 'hover:scale-105 transition-transform'}`}>
                                    <button className={`px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-bold ${!isEditingSkills && 'hover:bg-gray-50'}`}>
                                        {skill}
                                    </button>
                                    {isEditingSkills && (
                                        <button
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}

                            {isEditingSkills && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                        placeholder="Add skill..."
                                        className="px-3 py-1.5 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-blue-500 w-32"
                                    />
                                    <button
                                        onClick={handleAddSkill}
                                        className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold hover:bg-blue-700"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Top Recommendation (Large Card) */}
                            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md mb-4">Top recommendation</div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src="https://devopsify.co/wp-content/uploads/2023/10/pmp-600px1.png" alt="PMP" className="w-10 h-10 object-contain" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">PMP Exam Prep Certification Training Specialization</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        <span className="font-bold text-gray-900">Skills you'll gain:</span> Project Management, Engineering Documentation, Project Planning, Strategic Decision Making, Project Implementation...
                                    </p>
                                    <div className="flex items-center gap-1 text-sm mb-4">
                                        <span className="text-yellow-500 font-bold">★ 4.6</span>
                                        <span className="text-gray-500">(64 reviews)</span>
                                        <span className="text-gray-400 mx-2">•</span>
                                        <span className="text-gray-500">Beginner: 6 months</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Link to="/course/2" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors">Enroll for free</Link>
                                        <Link to="/course/2" className="text-blue-600 font-bold text-sm hover:underline">View details</Link>
                                    </div>
                                </div>
                                {/* Related Courses (Small Cards) */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { title: 'PMP Exam Prep: Project Management Principles', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80', course: 'Course 1 of 4' },
                                        { title: 'PMP Exam Prep: Managing People with Power Skills', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80', course: 'Course 2 of 4' },
                                        { title: 'PMP Exam Prep: Ways of Working for Technical Projects', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=80', course: 'Course 3 of 4' },
                                        { title: 'PMP Exam Prep: Project Management', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80', course: 'Course 4 of 4' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="group cursor-pointer">
                                            <div className="h-28 rounded-lg overflow-hidden mb-2 relative">
                                                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                            <h4 className="font-bold text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                            <p className="text-xs text-gray-500">{item.course}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Most Popular Certificates Section */}
                    <section className="container mx-auto px-4 py-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Most Popular Certificates</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Google UX Design', img: 'https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg?semt=ais_hybrid&w=740&q=80' },
                                { title: 'Google Digital Marketing & E-commerce', img: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&q=80' },
                                { title: 'Google IT Support', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80' },
                                { title: 'Google Cybersecurity', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80' }
                            ].map((item, idx) => (
                                <Link key={idx} to="/course/1" className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full block">
                                    <div className="h-40 bg-gray-100 relative">
                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google" className="w-5 h-5" />
                                            <span className="text-xs text-gray-500 font-medium">Google</span>
                                        </div>
                                        <h3 className="font-bold text-md mb-2 flex-1">{item.title} Professional Certificate</h3>
                                        <p className="text-xs text-gray-500 mt-auto">Professional Certificate</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Earn Your Degree Section */}
                    <section className="container mx-auto px-4 py-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Earn Your Degree</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Bachelor of Science in Data Science & AI', school: 'Indian Institute of Technology', img: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80', logo: 'https://logo.clearbit.com/iitg.ac.in' },
                                { title: 'Bachelor of Science in Computer Science', school: 'University of London', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80', logo: 'https://logo.clearbit.com/london.ac.uk' },
                                { title: 'MBA in Business Analytics', school: 'O.P. Jindal Global University', img: 'https://cdn.prod.website-files.com/6065f2e9b1d00071db835963/62b5d14ce3bd05099abe066c_Cover.png', logo: 'https://logo.clearbit.com/jgu.edu.in' },
                                { title: 'Master of Business Administration', school: 'Illinois Tech', img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&w=400&q=80', logo: 'https://logo.clearbit.com/iit.edu' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full">
                                    <div className="h-40 bg-gray-100 relative">
                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <img src={item.logo} alt={item.school} className="w-6 h-6 object-contain" />
                                            <span className="text-xs text-gray-500 font-medium line-clamp-1">{item.school}</span>
                                        </div>
                                        <h3 className="font-bold text-sm mb-2 flex-1">{item.title}</h3>
                                        <p className="text-xs text-gray-500 mt-auto">Degree</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            ) : (
                // LOGGED OUT VIEW (Original Landing Page)
                <>
                    {/* Hero Section */}
                    <section className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 space-y-6">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                                Start, switch, or advance your career
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                                Grow with 10,000+ courses from top organizations like Google, Yale, and Salesforce.
                            </p>
                            <button className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-md hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Join for Free
                            </button>
                        </div>
                        <div className="md:w-1/2 relative">
                            {/* Abstract Background Shapes */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 blur-3xl -z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Learner"
                                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl z-10 relative"
                            />
                        </div>
                    </section>

                    {/* Value Props Banner */}
                    <section className="bg-gray-50 py-12 border-y border-gray-100">
                        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <Briefcase size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Launch a new career</h3>
                                    <p className="text-gray-500">Professional Certificates</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <Award size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Gain in-demand skills</h3>
                                    <p className="text-gray-500">Specializations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <GraduationCap size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Earn a degree</h3>
                                    <p className="text-gray-500">Bachelor's & Master's</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Partner Logos */}
                    <section className="container mx-auto px-4 py-12 text-center">
                        <p className="text-gray-500 font-medium mb-8">Learn from 350+ leading universities and companies</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-8" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-8" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1200px-Seal_of_Leland_Stanford_Junior_University.svg.png" alt="Stanford" className="h-10" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="IBM" className="h-8" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Meta_Platforms_logo.svg/langvi-250px-Meta_Platforms_logo.svg.png" alt="Meta" className="h-6" />
                        </div>
                    </section>

                    {/* Trending Courses Section */}
                    <section className="container mx-auto px-4 py-16">
                        <h2 className="text-3xl font-bold mb-8">Trending courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Google Data Analytics', org: 'Google', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png', rating: '4.8', reviews: '120k' },
                                { title: 'Python for Everybody', org: 'Stanford University', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', logo: 'https://1000logos.net/wp-content/uploads/2018/02/Stanford-University-Logo.jpg', rating: '4.8', reviews: '80k' },
                                { title: 'AI & Machine Learning', org: 'IBM', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', rating: '4.7', reviews: '45k' }
                            ].map((item, idx) => (
                                <Link key={idx} to="/course/1" className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group block">
                                    <div className="h-48 bg-blue-50 relative overflow-hidden">
                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src={item.logo} alt={item.org} className="w-5 h-5 object-contain" />
                                            <span className="text-sm font-semibold text-gray-700">{item.org}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Professional Certificate</p>
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                            <span>{item.rating}</span>
                                            <span className="text-gray-400 font-normal">({item.reviews} reviews)</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Categories Chips */}
                    <section className="container mx-auto px-4 pb-16">
                        <h2 className="text-2xl font-bold mb-6">Explore categories</h2>
                        <div className="flex flex-wrap gap-3">
                            {['Business', 'Computer Science', 'Data Science', 'Information Technology', 'Health', 'Math and Logic', 'Personal Development', 'Physical Science and Engineering', 'Social Sciences', 'Language Learning'].map((cat) => (
                                <button key={cat} className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-all">
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Hot New Releases Banner */}
                    <section className="bg-blue-600 py-16 text-white">
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Hot new releases</h2>
                                    <p className="text-blue-100">Fresh content to keep your skills up to date.</p>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 font-bold rounded-md hover:bg-blue-50 transition-colors">
                                    Explore courses <ArrowRight size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* New Release Cards */}
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden text-gray-900 hover:transform hover:-translate-y-1 transition-all duration-300 shadow-lg">
                                        <div className="h-32 bg-gray-200 relative">
                                            <img src={`https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80`} alt="Course" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Specialization</span>
                                            </div>
                                            <h3 className="font-bold text-md mb-1 line-clamp-2">Generative AI for Everyone</h3>
                                            <p className="text-xs text-gray-500">DeepLearning.AI</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Explore Careers Section */}
                    <section className="container mx-auto px-4 py-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Explore careers</h2>
                            <button className="text-blue-600 font-bold hover:underline">Explore all &rarr;</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { title: 'Data Analyst', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' },
                                { title: 'Data Scientist', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=400&q=80' },
                                { title: 'Machine Learning Engineer', img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80' },
                                { title: 'Cyber Security Analyst', img: 'https://enablatechnology.com/wp-content/uploads/2025/06/Cyber-Security-Analyst-1.jpg' }
                            ].map((career, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                    <div className="h-32 mb-4 rounded-lg overflow-hidden">
                                        <img src={career.img} alt={career.title} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{career.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-3">
                                        Collect, clean, and interpret data to uncover insights and drive business decisions.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Certification Banner */}
                    <section className="container mx-auto px-4 mb-16">
                        <div className="bg-purple-700 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                            <div className="z-10 max-w-lg">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Prepare for an industry certification exam</h2>
                                <button className="px-6 py-3 bg-white text-purple-700 font-bold rounded-md hover:bg-gray-100 transition-colors">
                                    Explore courses &rarr;
                                </button>
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

                            <div className="flex gap-4 mt-8 md:mt-0 z-10 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
                                {/* Mini Cards inside banner */}
                                {[1, 2].map((i) => (
                                    <div key={i} className="min-w-[250px] bg-white text-gray-900 p-4 rounded-lg shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-4" />
                                            <span className="text-xs font-bold text-gray-500">Microsoft</span>
                                        </div>
                                        <h4 className="font-bold text-sm">Power BI Data Analyst</h4>
                                        <p className="text-xs text-gray-500 mt-1">Professional Certificate</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Most Popular by Category */}
                    <section className="container mx-auto px-4 pb-16">
                        <h2 className="text-2xl font-bold mb-8">Most popular by category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Category Column 1 */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="font-bold text-lg">Popular in Business</h3>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <img src={`https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=100&q=80`} alt="Course" className="w-16 h-16 rounded-md object-cover" />
                                            <div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google" className="w-3" />
                                                    <span className="text-xs text-gray-500">Google</span>
                                                </div>
                                                <h4 className="font-bold text-sm line-clamp-1">Project Management</h4>
                                                <p className="text-xs text-gray-500">Professional Certificate</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Column 2 */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="font-bold text-lg">Popular in Data</h3>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <img src={`https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&q=80`} alt="Course" className="w-16 h-16 rounded-md object-cover" />
                                            <div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="IBM" className="w-3" />
                                                    <span className="text-xs text-gray-500">IBM</span>
                                                </div>
                                                <h4 className="font-bold text-sm line-clamp-1">Data Science</h4>
                                                <p className="text-xs text-gray-500">Professional Certificate</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Column 3 */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="font-bold text-lg">Popular in Tech</h3>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </div>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <img src={`https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=100&q=80`} alt="Course" className="w-16 h-16 rounded-md object-cover" />
                                            <div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Meta_Platforms_logo.svg/langvi-250px-Meta_Platforms_logo.svg.png" alt="Meta" className="w-3" />
                                                    <span className="text-xs text-gray-500">Meta</span>
                                                </div>
                                                <h4 className="font-bold text-sm line-clamp-1">Front-End Developer</h4>
                                                <p className="text-xs text-gray-500">Professional Certificate</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;
