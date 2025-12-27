import React from "react";
import { Outlet } from "react-router-dom";

const KitchenLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Kitchen might have a different header or no header */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default KitchenLayout;
