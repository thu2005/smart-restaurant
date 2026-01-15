import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";

const WaiterHeader = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Get user from localStorage
        const userData = authService.getCurrentUser();
        if (userData) {
            setUser(userData);
        }
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "W";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="bg-primary-foreground text-foreground px-4 md:px-6 py-4 flex items-center justify-between shadow-warm">
            <h1 className="text-lg md:text-xl font-heading font-bold">
                Waiter Dashboard
            </h1>

            {/* Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center font-semibold text-sm md:text-base transition-smooth focus-ring"
                    aria-label="User menu"
                >
                    {getInitials(user?.fullName)}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-warm-lg overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-foreground">
                                {user?.fullName || "Waiter"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {user?.email}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted transition-smooth flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaiterHeader;
