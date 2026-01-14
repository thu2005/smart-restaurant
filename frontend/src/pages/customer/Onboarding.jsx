import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const Onboarding = () => {
  const navigate = useNavigate();

  const handleDineNow = () => {
    // Check if we have a table ID from the URL entry
    const tableId = sessionStorage.getItem('tableId');
    
    if (!tableId) {
      // For development/testing without scanning, we can prompt or set a default
      // In production, this might show an error or ask to scan again
      const manualTable = prompt("No table detected. Enter Table ID to test (e.g., 1):", "1");
      if (manualTable) {
        sessionStorage.setItem('tableId', manualTable);
        navigate("/customer/menu-browse");
      }
    } else {
      navigate("/customer/menu-browse");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500 blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl z-10 relative">
        <div className="text-center mt-auto">
          <div className="mx-auto h-24 w-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <img
              src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
              alt="Smart Restaurant Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
          <h2 className="text-3xl mt-[-15px] font-extrabold text-gray-900 tracking-tight">
            Smart Restaurant
          </h2>
          <p className="text-gray-500 text-lg">
            Experience the future of dining
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Start your meal
              </span>
            </div>
          </div>

          <Button
            onClick={handleDineNow}
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <Icon name="Utensils" className="w-6 h-6 mr-2" />
            Dine as Guest
          </Button>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or join us</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleLogin} className="w-full">
              Login
            </Button>
            <Button
              variant="outline"
              onClick={handleRegister}
              className="w-full"
            >
              Register
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
