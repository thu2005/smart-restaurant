import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminDashboardSidebar from "../components/navigation/AdminDashboardSidebar";
import Icon from "../components/AppIcon";
import authService from "../services/authService";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardSidebar
        isMobileOpen={sidebarOpen}
        onMobileToggle={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={setSidebarCollapsed}
      />
      <main
        className={`transition-all duration-300 p-6 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
      >
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-heading font-semibold text-foreground">
                {user?.name || "Restaurant Admin"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {user?.role === 'admin' ? 'Administrator' : 'Manager'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
              {(user?.name?.[0] || "A").toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="Logout"
            >
              <Icon name="LogOut" size={20} />
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
