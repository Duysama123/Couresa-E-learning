import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/login`, { username, password });
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password, name) => {
        try {
            const res = await axios.post(`${API_URL}/api/register`, { username, email, password, name });
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const googleLogin = async (credentialResponse) => {
        try {
            const jwt = credentialResponse.credential;
            const payload = JSON.parse(atob(jwt.split('.')[1]));

            const googleUserData = {
                username: payload.email.split('@')[0],
                email: payload.email,
                name: payload.name,
                avatar: payload.picture
            };

            // Call backend to create/get user
            const res = await axios.post(`${API_URL}/api/google-login`, googleUserData);

            if (res.data.success) {
                const finalUser = { ...res.data.user, isGoogle: true };
                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
                return { success: true };
            }
        } catch (error) {
            console.error("Google Auth Error:", error);
            return { success: false, message: 'Google Login failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
