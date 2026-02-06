import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    activeRole: 'learner' | 'mentor';
    login: (email: string, password: string, asMentor?: boolean) => Promise<void>;
    register: (name: string, email: string, password: string, asMentor?: boolean) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [activeRole, setActiveRole] = useState<'learner' | 'mentor'>('learner');

    const isAuthenticated = !!user && !!token;

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await api.auth.getMe();
                    if (response.success && response.data) {
                        setUser(response.data.user);
                        setToken(storedToken);
                        // Initialize role from user preference or local storage state if persisted
                        // For now default to user's default role or learner
                        setActiveRole(response.data.user.defaultRole === 'mentor' ? 'mentor' : 'learner');
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string, asMentor: boolean = false) => {
        const response = await api.auth.login(email, password);
        if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
            setUser(response.data.user);
            setActiveRole(asMentor ? 'mentor' : (response.data.user.defaultRole === 'mentor' ? 'mentor' : 'learner'));
        }
    };

    const register = async (name: string, email: string, password: string, asMentor: boolean = false) => {
        const response = await api.auth.register(name, email, password, asMentor ? 'mentor' : 'learner');
        if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            setToken(response.data.token);
            setUser(response.data.user);
            setActiveRole(asMentor ? 'mentor' : 'learner');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setActiveRole('learner');
    };

    const refreshUser = async () => {
        if (token) {
            try {
                const response = await api.auth.getMe();
                if (response.success && response.data) {
                    setUser(response.data.user);
                }
            } catch {
                logout();
            }
        }
    };

    const toggleRole = () => {
        setActiveRole(prev => prev === 'learner' ? 'mentor' : 'learner');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated,
                activeRole,
                login,
                register,
                logout,
                refreshUser,
                toggleRole
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
