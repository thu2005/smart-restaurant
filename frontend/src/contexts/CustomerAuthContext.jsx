import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

// Create context
const CustomerAuthContext = createContext(null);

/**
 * Customer Auth Provider - manages authentication state for customer-facing pages
 */
export const CustomerAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated and load user data
     */
    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);

            if (!authService.isAuthenticated()) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            // Try to get user data
            const userData = await authService.getMe();
            setUser(userData);
            setIsAuthenticated(true);

        } catch (error) {
            console.warn("Auth check failed:", error.message);

            // Try to refresh token
            try {
                const { user: refreshedUser } = await authService.refreshToken();
                setUser(refreshedUser);
                setIsAuthenticated(true);
            } catch (refreshError) {
                // Token refresh failed - user is not authenticated
                authService.clearAuth();
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Login user
     */
    const login = async (email, password) => {
        const { user: userData } = await authService.login(email, password);
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
    };

    /**
     * Register new user
     */
    const register = async (userData) => {
        const { user: newUser } = await authService.register(userData);
        setUser(newUser);
        setIsAuthenticated(true);
        return newUser;
    };

    /**
     * Logout user
     */
    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
    };

    return (
        <CustomerAuthContext.Provider value={value}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

/**
 * Hook to use customer auth context
 */
export const useCustomerAuth = () => {
    const context = useContext(CustomerAuthContext);
    if (!context) {
        throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
    }
    return context;
};

export default CustomerAuthContext;