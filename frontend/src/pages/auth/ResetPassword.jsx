import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    if (!token) {
      toast.error(t("auth.resetPassword.invalidToken", "Invalid or missing reset token"));
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success(t("auth.resetPassword.success", "Password reset successfully! You can now login with your new password."));
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.message || t("auth.resetPassword.failed", "Failed to reset password. The link may have expired."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border border-border">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-error/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("auth.resetPassword.invalidToken", "Invalid Reset Link")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("auth.resetPassword.invalidTokenDescription", "This password reset link is invalid or has expired. Please request a new one.")}
            </p>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              {t("auth.resetPassword.requestNew", "Request New Link")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {t("auth.resetPassword.title", "Reset Password")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.resetPassword.subtitle", "Enter your new password below.")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="password"
              label={t("auth.resetPassword.newPassword", "New Password")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              error={errors.password?.message}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              {...register("password", {
                required: t("auth.resetPassword.errors.passwordRequired", "Password is required"),
                minLength: {
                  value: 6,
                  message: t("auth.resetPassword.errors.passwordMinLength", "Password must be at least 6 characters"),
                },
              })}
            />

            <Input
              id="confirmPassword"
              label={t("auth.resetPassword.confirmPassword", "Confirm Password")}
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword((v) => !v)}
              {...register("confirmPassword", {
                required: t("auth.resetPassword.errors.confirmPasswordRequired", "Please confirm your password"),
                validate: (value) =>
                  value === password || t("auth.resetPassword.errors.passwordMismatch", "Passwords do not match"),
              })}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t("auth.resetPassword.submit", "Reset Password")}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t("auth.resetPassword.backToLogin", "Back to Login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
