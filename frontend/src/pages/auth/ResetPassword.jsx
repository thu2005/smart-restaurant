import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      toast.error("Invalid or missing reset token");
      navigate("/login");
    } else {
      setToken(resetToken);
    }
  }, [searchParams, navigate]);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success("Password reset successful! Please login with your new password.");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error.message || "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon name="Loader" className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border border-border">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <Icon name="KeyRound" className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below. Make sure it's strong and secure.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="password"
              label="New Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Enter new password"
              error={errors.password?.message}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Password must contain uppercase, lowercase, and number",
                },
              })}
            />

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword((v) => !v)}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Password Strength:</p>
              <div className="flex gap-2">
                <div
                  className={`h-2 flex-1 rounded ${
                    password.length >= 8 ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-2 flex-1 rounded ${
                    /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-2 flex-1 rounded ${
                    /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-2 flex-1 rounded ${
                    /\d/.test(password) ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className={password.length >= 8 ? "text-green-600" : ""}>
                  ✓ At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                  ✓ One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                  ✓ One lowercase letter
                </li>
                <li className={/\d/.test(password) ? "text-green-600" : ""}>
                  ✓ One number
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Icon name="Check" className="w-4 h-4 mr-2" />
              Reset Password
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </form>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <p className="font-semibold mb-1">🔒 Password Tips</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Use a unique password you don't use elsewhere</li>
            <li>Mix uppercase, lowercase, numbers, and symbols</li>
            <li>Avoid common words or personal information</li>
            <li>Consider using a password manager</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
