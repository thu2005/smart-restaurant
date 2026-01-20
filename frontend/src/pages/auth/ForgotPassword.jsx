import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border border-border">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="Mail" className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to <strong>{getValues("email")}</strong>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
              variant="outline"
            >
              <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <Button
              onClick={() => setEmailSent(false)}
              className="w-full"
              variant="ghost"
            >
              Resend Email
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <p className="font-semibold mb-2">📧 Didn't receive the email?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes for the email to arrive</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border border-border">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <Icon name="Lock" className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No worries! Enter your email address and we'll send you a link to reset your password.
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
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Icon name="Send" className="w-4 h-4 mr-2" />
              Send Reset Link
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

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
          <p className="font-semibold mb-1">🔒 Security Note</p>
          <p className="text-xs">
            For security reasons, we don't disclose whether an email exists in our system. 
            If the email is registered, you'll receive a reset link.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
