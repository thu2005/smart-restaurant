import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import RoleAdaptiveHeader from "../components/navigation/RoleAdaptiveHeader";
import AdminDashboardSidebar from "../components/navigation/AdminDashboardSidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardSidebar
        isMobileOpen={sidebarOpen}
        onMobileToggle={setSidebarOpen}
      />
      <main className="lg:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
