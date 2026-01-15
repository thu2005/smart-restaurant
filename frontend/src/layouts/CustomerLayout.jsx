import React from "react";
import { Outlet } from "react-router-dom";
import RoleAdaptiveHeader from "../components/navigation/RoleAdaptiveHeader";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <RoleAdaptiveHeader userRole="customer" />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
