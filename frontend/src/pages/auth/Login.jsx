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
      await authService.login(data.email, data.password);
      toast.success("Login successful!");
      // Get user from localStorage
      const user = authService.getCurrentUser();
      if (user?.role === "CUSTOMER") {
        navigate("/customer/menu-browse", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
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
