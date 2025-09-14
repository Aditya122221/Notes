import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('token');
        if (token) {
            apiService.setToken(token);
            // Verify token and get user info
            apiService.getCurrentUser()
                .then(userData => {
                    setUser(userData.user);
                })
                .catch(() => {
                    // Token is invalid, remove it
                    localStorage.removeItem('token');
                    apiService.setToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiService.login(email, password);
            const { token, user: userData } = response;

            localStorage.setItem('token', token);
            apiService.setToken(token);
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const adminSignup = async (email, password, companyName) => {
        try {
            const response = await apiService.adminSignup(email, password, companyName);
            const { token, user: userData } = response;

            localStorage.setItem('token', token);
            apiService.setToken(token);
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create company'
            };
        }
    };

    const inviteUser = async (email, password, role = 'member') => {
        try {
            const response = await apiService.inviteUser(email, password, role);
            return { success: true, data: response };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to invite user'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        apiService.setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const userData = await apiService.getCurrentUser();
            setUser(userData.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to refresh user data'
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        adminSignup,
        inviteUser,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
