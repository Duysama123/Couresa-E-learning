import React from 'react';
import MobileSimulator from '../components/MobileSimulator';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MobileSimulatorPage = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // if (!user) {
    //     return <Navigate to="/login" />;
    // }

    // Default to courseId 1 for the demo
    // Pass user (which might be null) so MobileSimulator handles the login state
    return <MobileSimulator courseId="1" user={user} standalone={true} />;
};

export default MobileSimulatorPage;
