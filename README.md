# 🎓 Couresa - Modern E-learning Platform

Welcome to **Couresa**, a specialized e-learning platform demo designed for the Digital Transformation course on Cloud Computing. This project demonstrates a modern specific-domain learning environment with features like AI-powered recommendations, cloud progress synchronization, and interactive learning tools.

## 🚀 Live Demo

- **Frontend (Vercel):** [https://couresa-e-learning.vercel.app](https://couresa-e-learning.vercel.app)
- **Backend (Render):** [https://couresa-backend.onrender.com](https://couresa-backend.onrender.com)

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
    *   Simulates peer interactions and AI tutor support.

4.  **📚 Interactive Learning Interface**:
    *   Integrated YouTube Video Player with custom controls.
    *   Progress tracking sidebar.
    *   Rich text reading materials and assignments.

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

# AI API Key (Optional - System uses robust fallback if missing)
# GROQ_API_KEY=your_groq_api_key

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
