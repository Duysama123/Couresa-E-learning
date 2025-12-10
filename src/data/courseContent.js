
export const COURSE_CONTENT = [
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
                src: "https://www.youtube.com/watch?v=8GofoyfO3TA&list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT"
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
                src: "https://youtu.be/nx0VMAES9kQ?list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT"
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
                src: "https://youtu.be/m6VJ2Nv8B44?list=PLpKyNBYcYNJec4bUTVZUqxBQF5ezd96RT"
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
