import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QREntry = () => {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (restaurantId && tableId) {
      // Store both restaurantId and tableId in localStorage
      localStorage.setItem("restaurantId", restaurantId);
      localStorage.setItem("tableId", tableId);

      console.log("QR Scan detected:", { restaurantId, tableId });

      // Check if user is already authenticated
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (token && user.role === "CUSTOMER") {
        // Already logged in as customer - go directly to menu
        navigate("/customer/menu-browse", { replace: true });
      } else if (token) {
        // Logged in as admin/staff - clear QR data and stay in admin
        localStorage.removeItem("restaurantId");
        localStorage.removeItem("tableId");
        navigate("/admin/menu/items", { replace: true });
      } else {
        // Not logged in - show onboarding (force showing it by redirecting to a dedicated route)
        navigate(`/customer-onboarding?restaurantId=${restaurantId}&tableId=${tableId}`, { replace: true });
      }
    } else {
      // If parameters are missing, go to root
      navigate("/", { replace: true });
    }
  }, [restaurantId, tableId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">Processing QR Code...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
      </div>
    </div>
  );
};

export default QREntry;
