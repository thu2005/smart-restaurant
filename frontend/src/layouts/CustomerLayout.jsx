import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import RoleAdaptiveHeader from "../components/navigation/RoleAdaptiveHeader";

const CustomerLayout = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  // Tạm thời lấy cartItemCount từ localStorage hoặc một State manager đơn giản
  useEffect(() => {
    // Trong thực tế, đây sẽ là Redux state hoặc Context
    const mockCartCount = 3; // Tạm thời hardcode
    setCartItemCount(mockCartCount);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <RoleAdaptiveHeader userRole="customer" cartItemCount={cartItemCount} />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
