import React, { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QREntry = () => {
  const { t } = useTranslation();
  const { restaurantId, tableId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (restaurantId && tableId) {
      const tableNumber = searchParams.get("tableNumber");

      // Store in localStorage
      localStorage.setItem("restaurantId", restaurantId);
      localStorage.setItem("tableId", tableId);
      if (tableNumber) {
        localStorage.setItem("tableNumber", tableNumber);
      }

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
        const onboardingUrl = tableNumber
          ? `/customer-onboarding?restaurantId=${restaurantId}&tableId=${tableId}&tableNumber=${tableNumber}`
          : `/customer-onboarding?restaurantId=${restaurantId}&tableId=${tableId}`;
        navigate(onboardingUrl, { replace: true });
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
        <p className="text-gray-700 text-lg font-medium">{t("customer.qrEntry.processing")}</p>
        <p className="text-gray-500 text-sm mt-2">{t("customer.qrEntry.wait")}</p>
      </div>
    </div>
  );
};

export default QREntry;
