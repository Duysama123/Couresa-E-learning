import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Globe, Bell, User, ChevronDown, Bot, Check, Settings, Cloud, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { toggleChat } = useChat();
    const navigate = useNavigate();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Notification State
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Cart State
    const [showCart, setShowCart] = useState(false);
    const cartRef = useRef(null);

    // Language State
    const [showLanguage, setShowLanguage] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('English');
    const languageRef = useRef(null);

    // Profile State
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef(null);

    // Mock Notifications
    const NOTIFICATIONS = [
        { id: 1, title: 'Learning Plan Reminder', message: 'Time to learn! You have 30 mins goal today.', time: '2 hours ago', read: false, type: 'plan' },
        { id: 2, title: 'New Assignment', message: 'Module 1 Challenge is due tomorrow.', time: '5 hours ago', read: false, type: 'assignment' },
        { id: 3, title: 'Welcome!', message: 'Welcome to the UX Design Professional Certificate.', time: '1 day ago', read: true, type: 'system' }
    ];

    // Mock Cart Items
    const CART_ITEMS = [
        { id: 1, title: 'Google Data Analytics Professional Certificate', price: 39.00, thumbnail: 'https://images.ctfassets.net/00atxywtfxvd/2QeS5ysKMhZ3ZjiU2rGRJA/e15df94b265053ce8ded4f5e630241c8/cropped-android-chrome-512x512-1.png' },
        { id: 2, title: 'Meta Front-End Developer Professional Certificate', price: 49.00, thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png' }
    ];

    // Mock Languages
    const LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' }
    ];

    const totalPrice = CART_ITEMS.reduce((acc, item) => acc + item.price, 0);
    const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setShowCart(false);
            }
            if (languageRef.current && !languageRef.current.contains(event.target)) {
                setShowLanguage(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16">
            <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
                {/* Left Section: Logo & Nav */}
                <div className="flex items-center gap-8 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2">
                        <div>
                            <img src="https://images.ctfassets.net/00atxywtfxvd/2QeS5ysKMhZ3ZjiU2rGRJA/e15df94b265053ce8ded4f5e630241c8/cropped-android-chrome-512x512-1.png" alt="Couresa" className="w-10" />
                        </div>
                        <span className="text-blue-600 font-bold text-2xl tracking-tight hidden sm:block">coursera</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-6">
                        <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
                            Explore <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                {/* Center Section: Search */}
                <div className="flex-1 max-w-xl hidden md:block px-4">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="What do you want to learn?"
                            className={`w-full pl-4 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${user ? 'bg-gray-100 border-transparent focus:bg-white' : 'border border-gray-300'}`}
                        />
                        <button type="submit" className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${user ? 'text-gray-500 hover:text-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                            <Search size={16} />
                        </button>
                    </form>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2 sm:gap-4 text-gray-600">
                                <button onClick={toggleChat} className="p-2 hover:bg-gray-100 rounded-full hover:text-blue-600 transition-colors" title="AI Assistant">
                                    <Bot size={22} />
                                </button>

                                <button onClick={() => navigate('/my-learning')} className="p-2 hover:bg-gray-100 rounded-full hover:text-blue-600 transition-colors" title="My Learning">
                                    <BookOpen size={22} />
                                </button>

                                {/* Shopping Cart Dropdown */}
                                <div className="relative" ref={cartRef}>
                                    <button
                                        onClick={() => setShowCart(!showCart)}
                                        className="p-2 hover:bg-gray-100 rounded-full hover:text-blue-600 transition-colors relative"
                                    >
                                        <ShoppingCart size={22} />
                                        {CART_ITEMS.length > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </button>

                                    {showCart && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in origin-top-right">
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-900 text-sm">Shopping Cart ({CART_ITEMS.length})</h3>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {CART_ITEMS.map(item => (
                                                    <div key={item.id} className="p-4 border-b border-gray-100 flex gap-3 hover:bg-gray-50 transition-colors">
                                                        <img src={item.thumbnail} alt={item.title} className="w-12 h-12 rounded object-cover border border-gray-200" />
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{item.title}</h4>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-blue-600">${item.price.toFixed(2)}</span>
                                                                <button className="text-xs text-red-500 hover:text-red-700">Remove</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-sm font-medium text-gray-600">Total:</span>
                                                    <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                                                </div>
                                                <button className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                                    Checkout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Language Selector Dropdown */}
                                <div className="relative hidden sm:block" ref={languageRef}>
                                    <button
                                        onClick={() => setShowLanguage(!showLanguage)}
                                        className="p-2 hover:bg-gray-100 rounded-full hover:text-blue-600 transition-colors relative"
                                        title="Select Language"
                                    >
                                        <Globe size={22} />
                                        {currentLanguage !== 'English' && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </button>

                                    {showLanguage && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in origin-top-right">
                                            <div className="py-2">
                                                {LANGUAGES.map(lang => (
                                                    <button
                                                        key={lang.code}
                                                        onClick={() => {
                                                            setCurrentLanguage(lang.name);
                                                            setShowLanguage(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex justify-between items-center group transition-colors"
                                                    >
                                                        <span className={`${currentLanguage === lang.name ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                                                            {lang.name}
                                                        </span>
                                                        {currentLanguage === lang.name && (
                                                            <Check size={16} className="text-blue-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notifications Dropdown */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 hover:bg-gray-100 rounded-full hover:text-blue-600 transition-colors relative"
                                    >
                                        <Bell size={22} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in origin-top-right">
                                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                                <button className="text-xs text-blue-600 hover:underline font-medium">Mark all as read</button>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {NOTIFICATIONS.map(notification => (
                                                    <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                                            <div className="flex-1">
                                                                <h4 className={`text-sm mb-0.5 ${!notification.read ? 'font-start font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-600 leading-snug mb-1.5">{notification.message}</p>
                                                                <span className="text-[10px] text-gray-400 font-medium">{notification.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                                                <button className="text-xs font-bold text-gray-600 hover:text-blue-600">View all notifications</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative ml-2" ref={profileRef}>
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                                    ) : (
                                        <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">
                                            {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </button>
                                {/* Dropdown Menu */}
                                {showProfile && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in origin-top-right">
                                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.name || user.username}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowProfile(false)}
                                                className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                            >
                                                <User size={16} /> Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setShowProfile(false)}
                                                className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                                            >
                                                <Settings size={16} /> Settings
                                            </Link>
                                            <Link
                                                to="/cloud-inspector"
                                                onClick={() => setShowProfile(false)}
                                                className="flex items-center gap-3 px-5 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                                            >
                                                <Cloud size={16} /> Cloud Inspector
                                            </Link>
                                        </div>
                                        <div className="border-t border-gray-100 py-2">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowProfile(false);
                                                    navigate('/login');
                                                }}
                                                className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-blue-600 font-bold text-sm hover:underline mr-2">
                                Log In
                            </Link>
                            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                                Join for Free
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};



export default Header;
