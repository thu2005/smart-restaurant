import React, { useState } from "react";
import authService from "../../../services/authService";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import OrderHistoryList from "./components/OrderHistoryList";

const Profile = () => {
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState("history");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        
        {/* Profile Header */}
        <div className="bg-card rounded-xl md:rounded-2xl border border-border p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-6 shadow-warm-sm animate-fade-in-up">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl md:text-5xl font-bold border-4 border-white dark:border-white/10 shadow-sm relative overflow-hidden">
             {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             ) : (
                <span>{(user?.name || "C").charAt(0).toUpperCase()}</span>
             )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              {user?.name || "Guest Customer"}
            </h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Icon name="Mail" size={16} />
              {user?.email || "No email provided"}
            </p>
            <p className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 inline-block px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
              {user?.role || "Member"}
            </p>
          </div>
          <div className="flex-shrink-0">
             <Button variant="outline" iconName="Edit2">
                Edit Profile
             </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors relative ${
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Order History
            {activeTab === "history" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors relative ${
              activeTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
             {activeTab === "settings" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "history" ? (
            <OrderHistoryList />
          ) : (
            <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground animate-fade-in">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                 <Icon name="Settings" size={32} className="opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Account Settings</h3>
              <p>Profile management and settings are coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
