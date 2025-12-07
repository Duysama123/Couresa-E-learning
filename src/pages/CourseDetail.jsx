import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, ChevronDown, Check, Globe, Linkedin, PlayCircle } from 'lucide-react';
import Header from '../components/Header';

// --- MOCK DATABASE ---
const courseDB = {
    '1': {
        id: '1',
        title: "Google UX Design Professional Certificate",
        description: "Get on the fast track to a career in UX design. In this certificate program, you'll learn in-demand skills, and get AI training from Google experts. Learn at your own pace, no degree or experience required.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        instructor: "Google Career Certificates",
        isTopInstructor: true,
        enrolledCount: "1,298,541",
        seriesCount: "5 course series",
        level: "Beginner Level",
        schedule: "6 months at 10 hours a week",
        rating: "4.8",
        reviews: "(85,456 reviews)",
        skills: [
            "Web Content Accessibility Guidelines", "Usability", "Professional Development",
            "Figma (Design Software)", "Mockups", "User Centered Design",
            "Wireframing", "UI/UX Research", "User Research", "Responsive Web Design"
        ],
        learningOutcomes: [
            "Follow the design process: empathize with users, define pain points, ideate solutions, create wireframes and prototypes, test and iterate on designs",
            "Understand the basics of UX research, like planning research studies, conducting interviews and usability studies, and synthesizing research results",
            "Apply foundational UX concepts, like user-centered design, accessibility, and equity-focused design",
            "Create a professional UX portfolio, including end-to-end projects, so that you're ready to apply for jobs"
        ],
        syllabus: [
            {
                title: "Foundations of User Experience (UX) Design",
                duration: "13 hours",
                image: "https://images.unsplash.com/photo-1581291518857-4e27f48f518c?auto=format&fit=crop&w=100&q=80",
                learningPoints: ["Foundational concepts in UX design", "Factors of great UX design", "Job responsibilities of UX designers", "Career paths in UX"],
                skills: ["User Experience (UX)", "UX Research", "Wireframing", "Prototyping", "User Design"]
            },
            {
                title: "Start the UX Design Process: Empathize, Define, and Ideate",
                duration: "21 hours",
                image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&w=100&q=80",
                learningPoints: ["Empathize with users", "Define user problems", "Ideate solutions", "Create personas and user stories"],
                skills: ["Empathy Maps", "Personas", "User Stories", "Problem Statements", "Ideation"]
            },
            {
                title: "Build Wireframes and Low-Fidelity Prototypes",
                duration: "11 hours",
                image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=100&q=80",
                learningPoints: ["Create storyboards", "Build wireframes in Figma", "Create low-fidelity prototypes", "Information architecture"],
                skills: ["Storyboarding", "Wireframing", "Figma", "Prototyping", "Information Architecture"]
            },
            {
                title: "Conduct UX Research and Test Early Concepts",
                duration: "15 hours",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&q=80",
                learningPoints: ["Plan usability studies", "Analyze research results", "Modify designs based on insights", "Present findings"],
                skills: ["Usability Testing", "Data Analysis", "Research Synthesis", "Presentation"]
            },
            {
                title: "Create High-Fidelity Designs and Prototypes in Figma",
                duration: "20 hours",
                image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=100&q=80",
                learningPoints: ["Create mockups and hi-fi prototypes", "Apply visual design elements", "Use design systems", "Collaborate with devs"],
                skills: ["Visual Design", "High-Fidelity Prototyping", "Design Systems", "Collaboration"]
            }
        ],
        faqs: ["What is a UX designer?", "Why start a career in UX design?", "What background knowledge is necessary?"]
    }
};

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEnrolled, setIsEnrolled] = useState(false);

    const course = courseDB[id] || courseDB['1'];

    // Initialize Syllabus/FAQ State dynamically based on content length
    const [openSyllabus, setOpenSyllabus] = useState([]);
    const [openFaq, setOpenFaq] = useState([]);

    useEffect(() => {
        if (course) {
            setOpenSyllabus(new Array(course.syllabus.length).fill(false).map((_, i) => i === 0)); // Open first by default
            setOpenFaq(new Array(course.faqs.length).fill(false));

            // Check enrollment
            // 1. Check specific course data
            const specificData = localStorage.getItem(`course_modules_data_${id}`);
            if (specificData) {
                setIsEnrolled(true);
            } else {
                // 2. Fallback/Legacy check for Course 1 (UX Design)
                if (id === '1') {
                    const savedData = localStorage.getItem('course_modules_data');
                    if (savedData) {
                        setIsEnrolled(true);
                    }
                }
            }
        }
    }, [course, id]);


    if (!course) {
        return <div className="p-12 text-center text-xl">Course not found</div>;
    }

    const toggleSyllabus = (index) => {
        const newState = [...openSyllabus];
        newState[index] = !newState[index];
        setOpenSyllabus(newState);
    };

    const toggleFaq = (index) => {
        const newState = [...openFaq];
        newState[index] = !newState[index];
        setOpenFaq(newState);
    };

    const handleEnroll = () => {
        // Generate mock modules for this specific course
        const newModules = course.syllabus.map((syl, idx) => ({
            id: idx + 1,
            title: `Module ${idx + 1}`,
            subtitle: syl.title,
            items: [
                {
                    id: `${idx + 1}-1`,
                    type: 'video',
                    title: `Introduction to ${syl.title}`,
                    duration: "5 min",
                    completed: false,
                    src: "/videos/video1.mp4"
                },
                {
                    id: `${idx + 1}-2`,
                    type: 'reading',
                    title: `Key concepts in ${syl.title}`,
                    duration: "10 min",
                    completed: false,
                    content: {
                        heading: syl.title,
                        intro: `Welcome to Module ${idx + 1}. In this module you will learn about ${syl.skills.join(', ')}.`,
                        sections: [
                            { heading: "Overview", text: "This section covers the fundamental principles..." },
                            { heading: "Learning Objectives", text: syl.learningPoints.join('. ') }
                        ]
                    }
                },
                {
                    id: `${idx + 1}-3`,
                    type: 'quiz',
                    title: `Module ${idx + 1} Quiz`,
                    duration: "15 min",
                    completed: false,
                    grade: null
                }
            ]
        }));

        localStorage.setItem(`course_modules_data_${course.id}`, JSON.stringify(newModules));
        localStorage.setItem('enrolled_course_info', JSON.stringify({
            id: course.id,
            title: course.title,
            logo: course.logo,
            totalModules: course.syllabus.length
        }));

        setIsEnrolled(true);
        navigate(`/learning/${course.id}`);
    };


    return (
        <div className="font-sans text-gray-900 bg-white">
            <Header />
            {/* Hero Section */}
            <div className="bg-[#f5f7fa] py-12 px-4 sm:px-8 lg:px-24 flex flex-col md:flex-row items-center justify-between border-b border-gray-200">
                <div className="max-w-3xl space-y-6">
                    <div className="flex items-center gap-2">
                        <img src={course.logo} alt="Logo" className="h-6" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        {course.title}
                    </h1>
                    <p className="text-lg text-gray-700">
                        {course.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-xs">{course.instructor[0]}</div>
                        <span className="font-semibold">Instructor: <span className="underline decoration-1 underline-offset-2">{course.instructor}</span></span>
                        {course.isTopInstructor && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">Top Instructor</span>}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => isEnrolled ? navigate('/learning/1') : handleEnroll()}
                            className="bg-[#0056d2] hover:bg-[#00419e] text-white font-semibold text-lg px-8 py-3 rounded-md shadow-sm transition-colors w-full md:w-auto inline-block text-center whitespace-nowrap"
                        >
                            {isEnrolled ? (
                                <span>Go to Course <br /><span className="text-sm font-normal text-blue-100">Continue Learning</span></span>
                            ) : (
                                <span>Enroll <br /><span className="text-sm font-normal text-blue-100">Starts Today</span></span>
                            )}
                        </button>
                    </div>

                    <div className="text-sm text-gray-600 font-medium">
                        {course.enrolledCount} already enrolled
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="hidden md:block w-80 h-80 relative opacity-10">
                    <div className="absolute inset-0 border-[40px] border-blue-600 rounded-full border-t-transparent border-r-transparent transform -rotate-45"></div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="py-8 px-4 sm:px-8 lg:px-24 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-1">
                        <div className="font-bold text-lg">{course.seriesCount}</div>
                        <div className="text-sm text-gray-600">Earn a career credential</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-bold text-lg flex items-center gap-1">{course.rating} <Star size={16} className="fill-blue-600 text-blue-600" /></div>
                        <div className="text-sm text-gray-600">{course.reviews}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-bold text-lg">{course.level}</div>
                        <div className="text-sm text-gray-600">Recommended Experience</div>
                    </div>
                    <div className="space-y-1">
                        <div className="font-bold text-lg">Flexible Schedule</div>
                        <div className="text-sm text-gray-600">{course.schedule}</div>
                    </div>
                </div>
            </div>

            {/* What You'll Learn */}
            <div className="py-12 px-4 sm:px-8 lg:px-24">
                <h2 className="text-2xl font-bold mb-8">What you'll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {course.learningOutcomes.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                            <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700 text-sm">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="py-12 px-4 sm:px-8 lg:px-24 bg-gray-50">
                <h2 className="text-2xl font-bold mb-8">Skills you'll gain</h2>
                <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-[#e4e8ef] text-gray-700 text-sm font-medium rounded-md">
                            {skill}
                        </span>
                    ))}
                    <button className="text-[#0056d2] font-semibold text-sm px-3 py-1.5 hover:underline">
                        View all skills
                    </button>
                </div>
            </div>

            {/* Syllabus Accordion */}
            <div className="py-12 px-4 sm:px-8 lg:px-24">
                <h2 className="text-2xl font-bold mb-2">Professional Certificate - {course.seriesCount}</h2>
                <p className="text-gray-600 text-sm mb-8 max-w-4xl">
                    Prepare for a career in {course.title.includes('UX') ? 'UX design' : 'Project Management'}. With professional training designed by {course.instructor}, get on the fast-track to a competitively paid job.
                </p>

                <div className="space-y-4">
                    {course.syllabus.map((item, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSyllabus(idx)}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex gap-4 items-start">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-12 h-12 rounded-md flex-shrink-0 object-cover"
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1 hover:underline decoration-blue-600">{item.title}</h3>
                                        <div className="text-xs text-gray-500 mt-1">Course {idx + 1} • {item.duration}</div>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openSyllabus[idx] ? 'rotate-180' : ''}`} />
                            </button>

                            {openSyllabus[idx] && (
                                <div className="p-6 border-t border-gray-100 bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-800">What you'll learn</h4>
                                        <div className="text-blue-600 text-sm font-semibold cursor-pointer hover:underline">Course details</div>
                                    </div>
                                    <ul className="space-y-2 mb-6">
                                        {item.learningPoints.map((point, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-gray-600">
                                                <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <h4 className="font-bold text-gray-800 mb-3">Skills you'll gain</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="py-12 px-4 sm:px-8 lg:px-24 bg-white border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-8">Frequently asked questions</h2>
                <div className="space-y-4">
                    {course.faqs.map((q, idx) => (
                        <div key={idx} className="border-b border-gray-200 pb-4">
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full flex items-center justify-between text-left font-medium text-gray-900 hover:text-gray-700"
                            >
                                {q}
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq[idx] ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq[idx] && (
                                <div className="pt-4 text-sm text-gray-600">
                                    This is a placeholder answer.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
