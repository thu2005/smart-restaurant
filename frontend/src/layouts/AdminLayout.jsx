import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminDashboardSidebar from "../components/navigation/AdminDashboardSidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
