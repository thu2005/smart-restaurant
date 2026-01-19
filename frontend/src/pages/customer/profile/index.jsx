import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../contexts/LanguageContext";
import authService from "../../../services/authService";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import OrderHistoryList from "./components/OrderHistoryList";
import EditProfileModal from "./components/EditProfileModal";
import UserReviews from "./components/UserReviews";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useLanguage();
  const [user, setUser] = useState(authService.getCurrentUser());
  const isGuest = !user;
  const [activeTab, setActiveTab] = useState(isGuest ? "settings" : "history");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch fresh user data on mount (only if logged in)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const freshUser = await authService.getMe();
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, []);

  const handleUpdateSuccess = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Profile Header */}
        <div className="bg-card rounded-xl md:rounded-2xl border border-border p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-6 shadow-warm-sm animate-fade-in-up">
          <Avatar
            user={user}
            size="xl"
            className="w-24 h-24 md:w-32 md:h-32 border-4 border-white dark:border-white/10 shadow-sm text-4xl md:text-5xl"
          />
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              {user?.fullName || user?.name || t("customer.profile.guest", "Guest")}
            </h1>
            {!isGuest ? (
              <>
                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                  <Icon name="Mail" size={16} />
                  {user?.email ||
                    t("customer.profile.noEmail", "No email provided")}
                </p>
                {user?.phone && (
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                    <Icon name="Phone" size={16} />
                    {user.phone}
                  </p>
                )}
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 inline-block px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  {user?.role || "Member"}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                {t("customer.profile.guestDesc", "Sign in to access your profile and order history")}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            {!isGuest ? (
              <Button
                variant="outline"
                iconName="Edit2"
                onClick={() => setIsEditModalOpen(true)}
              >
                {t("customer.profile.editProfile", "Edit Profile")}
              </Button>
            ) : (
              <Button
                variant="default"
                iconName="LogIn"
                onClick={() => window.location.href = "/login"}
              >
                {t("auth.login.submit", "Login")}
              </Button>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {!isGuest && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={user}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {!isGuest && (
            <>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors relative ${
                  activeTab === "history"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("customer.profile.tabs.orderHistory", "Order History")}
                {activeTab === "history" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors relative ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("customer.profile.tabs.myReviews", "My Reviews")}
                {activeTab === "reviews" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors relative ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("customer.profile.tabs.settings", "Settings")}
            {activeTab === "settings" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "history" && !isGuest && <OrderHistoryList />}
          {activeTab === "reviews" && !isGuest && <UserReviews />}
          {activeTab === "settings" && (
            <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-warm-sm animate-fade-in-up">
              <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-6">
                {t("customer.profile.settings.title", "Settings")}
              </h2>

              {/* Language Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    <Icon name="Globe" size={18} className="inline mr-2" />
                    {t("customer.profile.settings.language", "Language")}
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all ${
                        i18n.language === "en"
                          ? "bg-primary text-primary-foreground border-primary shadow-lg sm:scale-105"
                          : "bg-muted/30 text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">🇬🇧</span>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm sm:text-base">English</p>
                        <p className="text-[10px] sm:text-xs opacity-80">International</p>
                      </div>
                      {i18n.language === "en" && (
                        <Icon name="CheckCircle" size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                      )}
                    </button>
                    <button
                      onClick={() => changeLanguage("vi")}
                      className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all ${
                        i18n.language === "vi"
                          ? "bg-primary text-primary-foreground border-primary shadow-lg sm:scale-105"
                          : "bg-muted/30 text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">🇻🇳</span>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm sm:text-base">Tiếng Việt</p>
                        <p className="text-[10px] sm:text-xs opacity-80">Vietnamese</p>
                      </div>
                      {i18n.language === "vi" && (
                        <Icon name="CheckCircle" size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Additional Settings Info */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {t(
                        "customer.profile.settings.languageInfo",
                        "Your language preference will be saved and applied across the entire application."
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Guest Message for restricted tabs */}
          {isGuest && (activeTab === "history" || activeTab === "reviews") && (
            <div className="bg-card rounded-xl border border-border p-8 text-center shadow-warm-sm">
              <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("customer.profile.loginRequired", "Login Required")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("customer.profile.loginRequiredDesc", "Please sign in to view this content")}
              </p>
              <Button
                variant="default"
                iconName="LogIn"
                onClick={() => window.location.href = "/login"}
              >
                {t("auth.login.submit", "Login")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
