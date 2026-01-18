import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Register = () => {
  const { t } = useTranslation();
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
        toast.success(t("auth.register.success"));

        // Check if user came from QR scan
        const restaurantId = localStorage.getItem('restaurantId');
        const tableId = localStorage.getItem('tableId');

        // Navigate to menu if QR scan was done, otherwise go to root
        // Navigate to menu if QR scan was done, otherwise go to root
        navigate((restaurantId && tableId) ? `/customer/menu-browse/${restaurantId}/${tableId}` : "/");
      } else {
        // Email verification required
        toast.success(t("auth.register.successVerify"));
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || t("auth.register.failed"));
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
            {t("auth.register.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.register.subtitle")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="fullName"
              label={t("auth.register.fullName")}
              type="text"
              autoComplete="name"
              required
              error={errors.fullName?.message}
              {...register("fullName", {
                required: t("auth.register.errors.nameRequired"),
                minLength: {
                  value: 2,
                  message: t("auth.register.errors.nameMin"),
                },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: t("auth.register.errors.namePattern"),
                },
              })}
            />

            <Input
              id="email"
              label={t("auth.register.email")}
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email", {
                required: t("auth.register.errors.emailRequired"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("auth.register.errors.emailInvalid"),
                },
              })}
            />

            <div>
              <Input
                id="password"
                label={t("auth.register.password")}
                type="password"
                autoComplete="new-password"
                required
                error={errors.password?.message}
                {...register("password", {
                  required: t("auth.register.errors.passwordRequired"),
                  minLength: {
                    value: 8,
                    message: t("auth.register.errors.passwordMin"),
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                    message: t("auth.register.errors.passwordPattern"),
                  },
                })}
              />
              {!errors.password && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("auth.register.passwordHint")}
                </p>
              )}
            </div>

            <Input
              id="confirmPassword"
              label={t("auth.register.confirmPassword")}
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: t("auth.register.errors.confirmRequired"),
                validate: (value) =>
                  value === password || t("auth.register.errors.passwordMismatch"),
              })}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t("auth.register.submit")}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t("auth.register.hasAccount")} </span>
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-600"
            >
              {t("auth.register.signInLink")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
