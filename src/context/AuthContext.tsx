import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
    userId: string;
    email: string;
    brokerConnected: boolean;
    connectedBrokers: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        if (token) {
            try {
                const response = await api.get('/auth/status');
                setUser({
                    userId: response.data.userId,
                    email: response.data.email,
                    brokerConnected: response.data.brokerConnected,
                    connectedBrokers: response.data.connectedBrokers || []
                });
            } catch (error) {
                console.error('Auth verification failed', error);
                logout();
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, [token]);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
    };

    const signup = async (email: string, password: string) => {
        const response = await api.post('/auth/signup', { email, password });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const refreshAuth = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
