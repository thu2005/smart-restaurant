import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "../ui/Button";
import authService from "../../services/authService";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

const KitchenDisplayNav = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useLanguage();
  const [isHidden, setIsHidden] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = authService.getCurrentUser();

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const toggleNavVisibility = () => {
    setIsHidden(!isHidden);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <>
      <nav className={`kitchen-nav-bar ${isHidden ? "hidden" : ""}`}>
        <div className="kitchen-nav-bar-content">
          <div className="kitchen-nav-section">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Icon name="ChefHat" size={20} color="var(--color-primary)" />
              </div>
              <span className="text-lg font-heading font-semibold text-foreground">
                {t("nav.kitchen.title")}
              </span>
            </div>
          </div>

          <div className="kitchen-nav-section">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                {t("nav.kitchen.live")}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              iconName={soundEnabled ? "Volume2" : "VolumeX"}
              onClick={toggleSound}
              className="touch-target"
              aria-label={
                soundEnabled ? "Mute notifications" : "Unmute notifications"
              }
            />

            {/* Language Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  i18n.language === "en"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("vi")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  i18n.language === "vi"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                VI
              </button>
            </div>

            {/* User Profile & Logout */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-smooth touch-target"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {user?.fullName?.charAt(0) || "K"}
                </div>
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {user?.fullName || "Kitchen"}
                </span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-warm-lg border border-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.fullName || "Kitchen Staff"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user?.email || "kitchen@restaurant.com"}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          {user?.role || "KITCHEN"}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon
                          name="LogOut"
                          size={16}
                          className="text-destructive"
                        />
                        <span className="font-medium">
                          {t("nav.user.logout")}
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <button
        onClick={toggleNavVisibility}
        className="fixed top-2 right-2 z-[101] p-2 bg-card rounded-md shadow-warm hover:bg-muted transition-smooth touch-target"
        aria-label={isHidden ? "Show navigation" : "Hide navigation"}
      >
        <Icon name={isHidden ? "ChevronDown" : "ChevronUp"} size={20} />
      </button>
    </>
  );
};

export default KitchenDisplayNav;
