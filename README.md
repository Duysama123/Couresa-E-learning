# 🎓 Couresa - Modern E-learning Platform

Welcome to **Couresa**, a specialized e-learning platform demo designed for the Digital Transformation course on Cloud Computing. This project demonstrates a modern specific-domain learning environment with features like AI-powered recommendations, cloud progress synchronization, and interactive learning tools.

## 🚀 Live Demo: [https://couresa-e-learning.vercel.app](https://couresa-e-learning.vercel.app)


---

## ✨ Key Features

1.  **🤖 Smart AI Chatbot ("CourseMate")**:
    *   Acts as a personal learning advisor.
    *   Recommends courses based on user interests (UX Design, Web Dev, Data Science, etc.).
    *   *Note: Currently running in "Fallback Mode" to ensure 100% reliability for demos without API key dependencies.*

2.  **☁️ Cloud Progress Sync**:
    *   Automatically saves learning progress (completed lessons, modules) to the cloud (MongoDB).
    *   Allows seamless switching between devices without losing track.

3.  **💬 Live Discussion Simulation**:
    *   Real-time-like chat interface for course discussions.
    *   Simulates peer interactions.

4.  **📚 AI Learning Analytic Dashboard**:
    *   Dashboard visualize strengths, weaknesses of students.
    *   Suggested next courses.

---

## 🛠️ Tech Stack

### Frontend
-   **React (Vite)**: Fast and modern UI framework.
-   **Tailwind CSS**: For sleek, responsive styling.
-   **Lucide React**: Beautiful icons.
-   **React Router**: For seamless navigation.

### Backend
-   **Node.js & Express**: Robust RESTful API.
-   **MongoDB & Mongoose**: NoSQL database for flexible data storage.
-   **Cors & Dotenv**: Middleware for security and configuration.

### Deployment
-   **Frontend**: Vercel
-   **Backend**: Render (Free Tier)
-   **Database**: MongoDB Atlas

### AI Models (Current & Recommendations)

#### Current Implementation
-   **Live Discussion Bot**: Groq API with `llama-3.3-70b-versatile` (fallback to hardcoded responses)
-   **CourseMate Chatbot**: Rule-based fallback mode (no active AI model)

#### Recommended AI Models for Future Development

> **Note**: These recommendations are for when the project has resources for AI integration.

##### 1. **Large Language Models (LLMs)**

**🥇 Google Gemini (Recommended)**
-   **Model**: `gemini-1.5-flash` or `gemini-1.5-pro`
-   **Why**: Free tier available, excellent for educational content, fast response times, multimodal capabilities
-   **Use Cases**: Course recommendations, Q&A, content summarization, learning path generation
-   **Pricing**: Free tier: 15 RPM, Paid: $0.075/1M tokens (Flash)

**🥈 OpenAI GPT Models**
-   **Model**: `gpt-4o-mini` (cost-effective) or `gpt-4o` (advanced)
-   **Why**: Industry-leading quality, excellent reasoning, strong educational content understanding
-   **Use Cases**: Complex tutoring, personalized learning plans, assignment feedback
-   **Pricing**: GPT-4o-mini: $0.15/1M input tokens, GPT-4o: $2.50/1M input tokens

**🥉 Anthropic Claude**
-   **Model**: `claude-3-haiku` (fast) or `claude-3.5-sonnet` (balanced)
-   **Why**: Strong reasoning, longer context windows (200K tokens), excellent for educational dialogue
-   **Use Cases**: In-depth explanations, Socratic teaching, code tutoring
-   **Pricing**: Haiku: $0.25/1M tokens, Sonnet: $3/1M tokens

**💰 Open-Source Alternatives (Self-Hosted)**
-   **Llama 3.1 (8B/70B)**: Meta's open model, good for general tutoring
-   **Mistral 7B**: Lightweight, fast, suitable for course recommendations
-   **Phi-3**: Microsoft's small language model, optimized for educational tasks
-   **Deployment**: Ollama (local), Hugging Face Inference API, or Replicate

##### 2. **Specialized Education AI Models**

**📚 Education-Specific Models**
-   **Bloom**: BigScience's multilingual model (supports Vietnamese)
-   **EduChat**: Fine-tuned for educational conversations
-   **Minerva**: Google's model specialized in STEM education

##### 3. **Hybrid Approach (Recommended for Production)**

```
┌─────────────────────────────────────────┐
│  User Query → Intent Classification     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐      ┌────────────────┐
│ Simple Queries│      │ Complex Queries│
│ (Rule-Based)  │      │ (LLM API)      │
└───────────────┘      └────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌─────────────────────┐
        │  Response to User   │
        └─────────────────────┘
```

**Benefits**:
-   Cost optimization (use AI only when needed)
-   Fast responses for common queries
-   Scalable architecture

##### 4. **Implementation Roadmap**

**Phase 1: Free Tier Testing**
-   Integrate Google Gemini 1.5 Flash (free tier)
-   Test with 100 sample queries
-   Measure response quality and latency

**Phase 2: RAG Enhancement**
-   Add vector database (Pinecone/Chroma)
-   Store course content embeddings
-   Enable context-aware responses

**Phase 3: Fine-Tuning (Optional)**
-   Collect user interaction data
-   Fine-tune open-source model on educational domain
-   Deploy custom model for specialized responses

##### 5. **Cost Estimation (Monthly)**

| Scenario | Model | Estimated Cost |
|----------|-------|----------------|
| **Demo/Testing** | Gemini Flash (Free) | $0 |
| **Small Scale** (1K users) | GPT-4o-mini | $5-15 |
| **Medium Scale** (10K users) | Gemini Pro | $30-80 |
| **Large Scale** (100K users) | Hybrid (Rules + GPT-4o-mini) | $200-500 |

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/Duysama123/Couresa-E-learning.git
cd Couresa-E-learning
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run Frontend
npm run dev
```
*Frontend will run at `http://localhost:5173`*

### 3. Backend Setup
Open a new terminal:
```bash
cd server

# Install dependencies
npm install

# Run Backend
npm run dev
```
*Backend will run at `http://localhost:5000` (or port 10000 in production)*

---

## 🔐 Environment Variables (.env)

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Port
PORT=5000

# MongoDB Connection String (Replace with your own if needed)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0

# AI API Keys (Choose one or multiple based on your needs)
# ============================================================

# Option 1: Google Gemini (Recommended - Free tier available)
# Get your key: https://aistudio.google.com/app/apikey
# GEMINI_API_KEY=your_gemini_api_key

# Option 2: OpenAI (GPT-4o, GPT-4o-mini)
# Get your key: https://platform.openai.com/api-keys
# OPENAI_API_KEY=your_openai_api_key

# Option 3: Anthropic Claude
# Get your key: https://console.anthropic.com/
# ANTHROPIC_API_KEY=your_anthropic_api_key

# Option 4: Groq (Currently used for Live Discussion - Fast inference)
# Get your key: https://console.groq.com/keys
# GROQ_API_KEY=your_groq_api_key

# Note: System uses robust fallback if no API key is provided
# For production, we recommend using Google Gemini Flash (free tier) or GPT-4o-mini

# Frontend URL (For CORS)
FRONTEND_URL=http://localhost:5173
```


---

## 📝 Demo Scripts (For Presentation)

To demonstrate the Chatbot effectively:
1.  Open the Chatbot (bottom right).
2.  Type **"Hello"** to start the conversation.
3.  Type **"I want to learn UX Design"** to see course recommendations.
4.  Type **"Web Development"** to explore other paths.

---

*Project developed by [Your Name] for Cloud Computing Course Demo.*
