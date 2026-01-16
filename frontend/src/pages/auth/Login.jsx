import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AppImage from "../../components/AppImage";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Get return url from location state or default to menu items
  const from = location.state?.from?.pathname || "/admin/menu/items";

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "admin@cafepoirot.com",
      password: "password123",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      toast.success("Login successful!");

      // Check if user came from QR scan (has restaurantId and tableId)
      const restaurantId = localStorage.getItem("restaurantId");
      const tableId = localStorage.getItem("tableId");

      // Determine redirect path based on role if no specific return url
      let targetPath = from;
      if (targetPath === "/admin/menu/items") {
        // Default value check
        const userRole = response.data?.role;
        if (userRole === "SUPER_ADMIN") {
          targetPath = "/superadmin/users";
        } else if (userRole === "CUSTOMER") {
          // If QR scan was done, go to menu-browse, otherwise default customer page
          targetPath = (restaurantId && tableId) ? `/customer/menu-browse/${restaurantId}/${tableId}` : "/customer/menu-browse";
        } else if (userRole === "WAITER") {
          targetPath = "/waiter";
        } else if (userRole === "KITCHEN") {
          targetPath = "/kitchen/dashboard";
        }
      }

      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-40 w-40 bg-primary-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <img
              src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
              alt="Smart Restaurant Logo"
              className="h-30 w-30 object-contain"
            />
          </div>
          <h2 className="mt-[-20px] text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Smart Restaurant Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />

            <Input
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              error={errors.password?.message}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              {...register("password", { required: "Password is required" })}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-blue-700">
            <p className="font-semibold">Test Credentials:</p>
            <p>Email: admin@cafepoirot.com</p>
            <p>Password: password123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
