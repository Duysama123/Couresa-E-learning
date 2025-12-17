// API Configuration for different environments
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Chatbot Mode: 'edge' for Vercel Edge Function (fastest), 'backend' for traditional server
export const CHATBOT_MODE = import.meta.env.VITE_CHATBOT_MODE || 'edge';

export default API_URL;
