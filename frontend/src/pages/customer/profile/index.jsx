import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import authService from "../../../services/authService";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const Profile = () => {
  const { t } = useTranslation();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState("history");

  // Mock Order History Data
  const orderHistory = [
    {
      id: "ORD-0051",
      date: "2024-01-14",
      total: 820000,
      status: "completed",
      items: ["Grilled Salmon", "Caesar Salad", "White Wine"],
    },
    {
      id: "ORD-0048",
      date: "2024-01-10",
      total: 450000,
      status: "completed",
      items: ["Spaghetti Carbonara", "Tiramisu"],
    },
    {
      id: "ORD-0032",
      date: "2023-12-28",
      total: 1250000,
      status: "completed",
      items: ["Steak Frites", "Lobster Bisque", "Red Wine", "Cheesecake"],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success";
      case "processing":
        return "bg-warning/10 text-warning";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">

        {/* Profile Header */}
        <div className="bg-card rounded-xl md:rounded-2xl border border-border p-6 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-6 shadow-warm-sm">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl md:text-5xl font-bold border-4 border-white shadow-sm">
            {(user?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              {user?.name || t("customer.profile.guest", "Guest Customer")}
            </h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Icon name="Mail" size={16} />
              {user?.email || t("customer.profile.noEmail", "No email provided")}
            </p>
            <p className="text-sm font-medium text-primary bg-primary/10 inline-block px-3 py-1 rounded-full">
              {user?.role ? t(`customer.profile.roles.${user.role.toLowerCase()}`, user.role) : t("customer.profile.role", "Member")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button variant="outline" iconName="Edit2">
              {t("customer.profile.edit", "Edit Profile")}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors ${activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t("customer.profile.tabs.history", "Order History")}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 text-sm md:text-base font-medium border-b-2 transition-colors ${activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {t("customer.profile.tabs.settings", "Settings")}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "history" ? (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-lg md:rounded-xl border border-border p-4 md:p-6 hover:shadow-warm transition-smooth"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-heading font-bold text-lg">
                          {t("customer.orderTracking.bill.orderNumber", { number: order.id })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {t(`customer.orderTracking.status.${order.status}`, order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground">{t("customer.orderHistory.total", "Total Amount")}</p>
                      <p className="font-heading font-bold text-xl text-primary data-text">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{t("customer.profile.items", "Items: ")}</span>
                      {order.items.join(", ")}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <Button variant="outline" size="sm" iconName="Repeat">
                      {t("customer.orderHistory.reorder", "Reorder")}
                    </Button>
                    <Button variant="ghost" size="sm" iconName="FileText">
                      {t("customer.orderHistory.viewReceipt", "View Receipt")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
              <Icon name="Settings" size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t("customer.profile.settings.comingSoon", "Account settings are coming soon!")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
