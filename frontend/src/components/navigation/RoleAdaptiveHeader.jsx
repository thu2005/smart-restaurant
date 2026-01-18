import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "../ui/Button";
import authService from "../../services/authService";
import { useCart } from "../../contexts/CartContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

const RoleAdaptiveHeader = ({ userRole = "customer" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [tableNumber, setTableNumber] = useState(
    localStorage.getItem("tableNumber")
  );
  const { getCartSummary } = useCart();
  const { itemCount: cartItemCount } = getCartSummary();

  useEffect(() => {
    // Refresh user and table info on mount
    setUser(authService.getCurrentUser());
    const storedTableNumber = localStorage.getItem("tableNumber");
    setTableNumber(storedTableNumber);
  }, []);

  const handleLogout = () => {
    const isCustomer = !user?.role || user.role === 'CUSTOMER';
    authService.logout();
    setUser(null);

    if (isCustomer) {
      navigate("/customer-onboarding");
    } else {
      navigate("/login");
    }
  };

  /* Nav Items Configuration */
  const baseCustomerNavItems = [
    { path: "/customer/menu-browse", label: t("nav.items.menu"), icon: "UtensilsCrossed" },
    {
      path: "/customer/shopping-cart",
      label: t("nav.items.cart"),
      icon: "ShoppingCart",
      badge: cartItemCount,
    },
    {
      path: "/customer/order-status-tracking",
      label: t("nav.items.orderStatus"),
      icon: "ClipboardList",
    },
  ];

  // Add Profile for logged-in users
  const customerNavItems = user
    ? [...baseCustomerNavItems, { path: "/customer/profile", label: t("nav.items.profile"), icon: "User" }]
    : baseCustomerNavItems;

  const adminNavItems = [
    { path: "/admin/dashboard", label: t("nav.items.dashboard"), icon: "LayoutDashboard" },
    {
      path: "/admin/kitchen/dashboard",
      label: t("nav.items.kitchen"),
      icon: "ChefHat",
    },
    { path: "/customer/menu-browse", label: t("nav.items.menu"), icon: "UtensilsCrossed" },
  ];

  const navItems = userRole === "admin" ? adminNavItems : customerNavItems;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActivePath = (targetPath) => {
    if (!location?.pathname) return false;

    // Fix: Keep Menu active when viewing item detail
    if (targetPath === "/customer/menu-browse" && location.pathname.includes("/customer/menu-item-detail")) {
      return true;
    }

    // Exact match
    if (location.pathname === targetPath) return true;

    // Prefix match for nested routes (e.g., /customer/menu-browse/123/456 matches /customer/menu-browse)
    if (targetPath !== "/" && location.pathname.startsWith(targetPath)) {
      const charAfterPrefix = location.pathname[targetPath.length];
      return !charAfterPrefix || charAfterPrefix === "/";
    }

    return false;
  };

  // Mobile Menu Component using Portal
  const MobileMenuPortal = () => {
    if (!mobileMenuOpen) return null;

    return createPortal(
      <div className="fixed inset-0 z-[200] md:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity cursor-pointer"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer content */}
        <div className="fixed inset-y-0 right-0 w-[280px] bg-background shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <span className="font-heading font-bold text-xl text-primary">
              {t("nav.items.menu")}
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-foreground/60 hover:text-destructive transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    flex items-center justify-between p-4 rounded-xl text-base font-medium transition-smooth
                    ${active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={item.icon}
                      size={22}
                      className={active ? "stroke-[2.5px]" : "stroke-2"}
                    />
                    {item.label}
                  </div>
                  {item.badge > 0 && (
                    <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-border flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-2 mb-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {(user.fullName || user.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-foreground truncate">
                      {(user.fullName || user.name || "Customer").split(" ").pop()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("nav.user.member")}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200"
                >
                  <Icon name="LogOut" className="mr-3" size={18} /> {t("nav.user.logout")}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => handleNavigation("/login")}
                className="w-full"
                variant="primary"
              >
                {t("nav.user.loginRegister")}
              </Button>
            )}
          </div>

          {/* Language Toggle - Mobile */}
          <div className="px-2 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
              {t("nav.language.title", "Language")}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  changeLanguage('en');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${i18n.language === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-foreground hover:bg-muted/70'
                  }`}
              >
                🇬🇧 {t("nav.language.english", "English")}
              </button>
              <button
                onClick={() => {
                  changeLanguage('vi');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${i18n.language === 'vi'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-foreground hover:bg-muted/70'
                  }`}
              >
                🇻🇳 {t("nav.language.vietnamese", "Tiếng Việt")}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-card border-b border-border shadow-sm">
        <div className="relative flex items-center justify-between h-14 px-4 md:h-16 md:px-6">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer min-w-0"
            onClick={() =>
              handleNavigation(
                userRole === "admin"
                  ? "/admin/dashboard"
                  : "/customer/menu-browse"
              )
            }
          >
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-base md:text-xl font-heading font-semibold text-foreground truncate max-w-[150px] md:max-w-none">
              Smart Restaurant
            </span>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            {navItems?.slice(0, 4)?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-full
                  transition-smooth touch-target
                  ${isActivePath(item?.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-muted hover:text-primary"
                  }
                `}
              >
                <Icon name={item?.icon} size={20} />
                <span className="font-medium">{item?.label}</span>
                {item?.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm border border-white">
                    {item?.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Table Info */}
            {tableNumber && (
              <div className="flex items-center px-3 py-1.5 border border-primary/20 rounded-full bg-primary/5">
                <span className="text-xs md:text-sm font-bold text-primary whitespace-nowrap">
                  {t("nav.items.tables")} {tableNumber}
                </span>
              </div>
            )}

            {/* Language Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full border border-border">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i18n.language === 'en'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title={t("nav.language.english", "English")}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('vi')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i18n.language === 'vi'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title={t("nav.language.vietnamese", "Tiếng Việt")}
              >
                VI
              </button>
            </div>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-medium text-gray-700 leading-none">
                    {(user.fullName || user.name || "Customer").split(" ").pop()}
                  </span>
                  <span className="text-xs text-gray-500 leading-none mt-1">
                    {t("nav.user.member")}
                  </span>
                </div>
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                  {(user.fullName || user.name || "C").charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title={t("nav.user.logout")}
                >
                  <Icon name="LogOut" size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs h-8 px-3"
                >
                  {t("auth.login.submit")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Render Mobile Menu Portal */}
      <MobileMenuPortal />

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full space-y-1
                  transition-colors duration-200
                  ${active
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <div className="relative">
                  <Icon
                    name={item.icon}
                    size={24}
                    className={active ? "stroke-[2.5px]" : "stroke-2"}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${active ? "font-semibold" : ""
                    }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default RoleAdaptiveHeader;
