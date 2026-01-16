import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Ensure role is set to CUSTOMER
      const payload = {
        ...data,
        role: "CUSTOMER",
      };

      const response = await authService.register(payload);

      // If token is returned, auto-login
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        toast.success("Registration successful! Welcome!");

        // Check if user came from QR scan
        const restaurantId = localStorage.getItem('restaurantId');
        const tableId = localStorage.getItem('tableId');

        // Navigate to menu if QR scan was done, otherwise go to root
        // Navigate to menu if QR scan was done, otherwise go to root
        navigate((restaurantId && tableId) ? `/customer/menu-browse/${restaurantId}/${tableId}` : "/");
      } else {
        // Email verification required
        toast.success("Registration successful! Please check your email to verify.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border border-border">
        <div className="text-center">
          <div className="mx-auto h-40 w-40 bg-primary-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <img
              src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
              alt="Smart Restaurant Logo"
              className="h-30 w-30 object-contain"
            />
          </div>
          <h2 className="mt-[-20px] text-3xl font-extrabold text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Smart Restaurant today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              autoComplete="name"
              required
              error={errors.fullName?.message}
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Name must only contain letters and spaces",
                },
              })}
            />

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

            <div>
              <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                    message: "Password must include uppercase, lowercase, number, and special character",
                  },
                })}
              />
              {!errors.password && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign up
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-600"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
