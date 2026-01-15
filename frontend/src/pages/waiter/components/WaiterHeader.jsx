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
        <header className="sticky top-0 z-[100] bg-card border-b border-border shadow-sm">
            <div className="relative flex items-center justify-between h-14 px-4 md:h-16 md:px-6">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 md:gap-3 cursor-pointer min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                            src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className="text-base md:text-xl font-heading font-semibold text-foreground truncate max-w-[150px] md:max-w-none">
                        Smart Restaurant
                    </span>
                </div>

                {/* Center: Title */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                    <h1 className="text-lg font-heading font-bold text-foreground">
                        Waiter Dashboard
                    </h1>
                </div>

                {/* Right: User Info & Logout */}
                <div className="flex items-center gap-2" ref={dropdownRef}>
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-medium text-gray-700 leading-none">
                            {user?.fullName || "Waiter"}
                        </span>
                        <span className="text-xs text-gray-500 leading-none mt-1">
                            Waiter
                        </span>
                    </div>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 hover:bg-primary/90 transition-smooth"
                        aria-label="User menu"
                    >
                        {getInitials(user?.fullName)}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <svg
                            className="w-5 h-5"
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
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-warm-lg overflow-hidden z-50">
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
        </header>
    );
};

export default WaiterHeader;
