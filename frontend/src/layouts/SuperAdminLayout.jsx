import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Icon from "../components/AppIcon";
import authService from "../services/authService";

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Smart Restaurant</h1>
                <p className="text-xs text-purple-600 font-semibold">Super Admin Panel</p>
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.fullName || "Super Admin"}
                  </p>
                  <p className="text-xs text-purple-600 font-medium">
                    System Administrator
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-purple-700 font-bold shadow-sm">
                  {(user?.fullName?.[0] || "S").toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <Icon name="LogOut" size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
