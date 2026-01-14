import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TableEntry = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (tableId) {
      // Save table ID to session storage (valid for this browser session)
      sessionStorage.setItem("tableId", tableId);

      // Redirect to onboarding (root) to let user choose Guest or Login
      navigate("/");
    } else {
      navigate("/");
    }
  }, [tableId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to table...</p>
      </div>
    </div>
  );
};

export default TableEntry;
