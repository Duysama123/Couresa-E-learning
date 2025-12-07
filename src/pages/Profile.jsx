import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Clock, Calendar } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    // Mock user stats
    const stats = [
        { label: 'Courses in Progress', value: '2', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Completed Courses', value: '1', icon: Award, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Learning Hours', value: '12', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Streak Days', value: '5', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="relative">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-blue-50" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name || user.username}</h1>
                            <p className="text-gray-500">{user.email}</p>
                            <p className="text-sm text-blue-600 font-medium mt-1">Student</p>
                        </div>
                        <button className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            Edit Profile
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                                    <stat.icon size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Completed "Introduction to UX Design" quiz</p>
                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
