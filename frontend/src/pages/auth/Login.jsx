import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AppImage from "../../components/AppImage";

const Login = () => {
  const { t } = useTranslation();
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
      toast.success(t("auth.login.success"));

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
        error.message || t("auth.login.failed")
      );
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
            {t("auth.login.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              label={t("auth.login.email")}
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email", {
                required: t("auth.login.errors.emailRequired"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("auth.login.errors.emailInvalid"),
                },
              })}
            />

            <Input
              id="password"
              label={t("auth.login.password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              error={errors.password?.message}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
              {...register("password", { required: t("auth.login.errors.passwordRequired") })}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t("auth.login.submit")}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.login.noAccount")}{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("auth.login.signUpLink")}
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-md text-sm text-foreground">
            <p className="font-semibold">{t("auth.login.testCredentials.title")}</p>
            <p>{t("auth.login.testCredentials.email")}</p>
            <p>{t("auth.login.testCredentials.password")}</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
