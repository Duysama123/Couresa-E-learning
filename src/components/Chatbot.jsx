import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Star } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const Chatbot = () => {
    const { isOpen, closeChat, initialMessage, setInitialMessage } = useChat();
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hi! I\'m CourseMate. I can help you find the perfect course. What are you interested in learning today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle initial message from context
    useEffect(() => {
        if (initialMessage && isOpen) {
            sendMessage(initialMessage);
            setInitialMessage(null);
        }
    }, [initialMessage, isOpen]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Convert messages to Gemini history format
            let historyMessages = messages.filter(m => m.text);
            const firstUserIndex = historyMessages.findIndex(m => m.type === 'user');
            if (firstUserIndex !== -1) {
                historyMessages = historyMessages.slice(firstUserIndex);
            } else {
                historyMessages = [];
            }

            const history = historyMessages.map(m => ({
                role: m.type === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history })
            });

            const data = await response.json();

            // Parse the AI's JSON response
            let parsedData;

            // Backend now returns parsed object directly, so we check using type
            if (typeof data.text === 'object' || (data.text && !data.options && !data.courses && typeof data.text === 'string')) {
                // Try to parse if it looks like a JSON string meant to be parsed
                try {
                    const cleanText = typeof data.text === 'string'
                        ? data.text.replace(/```json\n?|\n?```/g, '').trim()
                        : null;

                    if (cleanText && (cleanText.startsWith('{') || cleanText.startsWith('['))) {
                        parsedData = JSON.parse(cleanText);
                    } else {
                        // It's already the data we want, or a simple string
                        parsedData = data.text && typeof data.text === 'object' ? data.text : data;
                    }
                } catch (e) {
                    parsedData = data;
                }
            } else {
                // If data itself has the structure we need
                parsedData = data;
            }

            // Ensure parsedData has text property
            if (!parsedData.text && data.text) {
                parsedData = { text: typeof data.text === 'string' ? data.text : JSON.stringify(data.text) };
            }

            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: parsedData.text,
                options: parsedData.options, // Dynamic options from AI
                courses: parsedData.courses  // Dynamic course cards from AI
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: "Sorry, something went wrong. Please try again."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => sendMessage(input);
    const handleOptionClick = (option) => sendMessage(option);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 font-sans">
            {/* Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-full">
                        <Bot size={20} />
                    </div>
                    <h3 className="font-bold text-lg">CourseMate</h3>
                </div>
                <button onClick={closeChat} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'bot' && (
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-yellow-600">
                                <Bot size={16} />
                            </div>
                        )}
                        <div className={`max-w-[80%] space-y-2`}>
                            {msg.text && (
                                <div className={`p-3 rounded-2xl text-sm ${msg.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            )}

                            {/* Options Chips */}
                            {msg.options && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {msg.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(opt)}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full hover:bg-blue-200 transition-colors"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Course Cards */}
                            {msg.courses && (
                                <div className="space-y-3 mt-2">
                                    {msg.courses.map((course, idx) => (
                                        <div key={idx} className={`${course.color} p-4 rounded-xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer`}>
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">{course.title}</h4>
                                            <p className="text-xs text-gray-600 mb-2">Timeline: {course.timeline}</p>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Star size={12} className="text-blue-600 fill-blue-600" />
                                                <span className="font-bold text-gray-900">{course.rating}</span>
                                                <span className="text-gray-500">({course.reviews})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-yellow-600">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
