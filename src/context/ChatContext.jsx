import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [initialMessage, setInitialMessage] = useState(null);

    const toggleChat = () => setIsOpen(prev => !prev);
    const openChat = () => setIsOpen(true);
    const closeChat = () => {
        setIsOpen(false);
        setInitialMessage(null);
    };

    const openChatWithMessage = (message) => {
        setInitialMessage(message);
        setIsOpen(true);
    };

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, openChat, closeChat, openChatWithMessage, initialMessage, setInitialMessage }}>
            {children}
        </ChatContext.Provider>
    );
};
