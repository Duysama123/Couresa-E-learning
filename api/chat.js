export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { message } = await req.json();
        console.log("Edge Chat Request:", message);

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

        // 4. DevOps & Specialized
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

        // 5. UX Design (Retained)
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

        // 6. Web Development (Retained)
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

        // 7. Data Science (Retained)
        else if (lowerMsg.includes("data") || lowerMsg.includes("python") || lowerMsg.includes("ai")) {
            response = {
                text: "Data Science is solving the world's problems! Do you prefer analyzing data (Analytics) or building models (AI/ML)?",
                options: ["Data Analytics", "Machine Learning", "Python Basics"]
            };
        }

        // 8. Cybersecurity Path (New)
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

        // 9. Mobile Development Path (New)
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

        // 10. Blockchain Path (New)
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

        // Return JSON response
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error("Edge Function Error:", error);
        return new Response(JSON.stringify({
            text: "I'm having a bit of trouble connecting right now. Why don't we try exploring our catalog directly?",
            options: ["Browse Catalog", "Contact Support"]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
