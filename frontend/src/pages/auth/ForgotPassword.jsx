import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      toast.success(t("auth.forgotPassword.emailSent", "Password reset email sent! Please check your inbox."));
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || t("auth.forgotPassword.failed", "Failed to send reset email. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border border-border">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("auth.forgotPassword.checkEmail", "Check your email")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("auth.forgotPassword.emailSentDescription", "We've sent you a password reset link. Please check your inbox and follow the instructions.")}
            </p>
            <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
              {t("auth.forgotPassword.backToLogin", "Back to Login")}
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
            {t("auth.forgotPassword.title", "Forgot Password")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.forgotPassword.subtitle", "Enter your email address and we'll send you a link to reset your password.")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              label={t("auth.forgotPassword.email", "Email address")}
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email", {
                required: t("auth.forgotPassword.errors.emailRequired", "Email is required"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("auth.forgotPassword.errors.emailInvalid", "Invalid email address"),
                },
              })}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t("auth.forgotPassword.submit", "Send Reset Link")}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t("auth.forgotPassword.backToLogin", "Back to Login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
