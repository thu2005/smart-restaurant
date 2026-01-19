import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";

const OrderHeader = ({
  orderNumber,
  tableNumber,
  timestamp,
  totalItems,
  status,
  currentTime,
}) => {
  const { t } = useTranslation();

  const getElapsedTime = () => {
    const elapsed = Math.floor((currentTime - timestamp) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs?.toString()?.padStart(2, "0")}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case "submitted":
        return {
          label: t("customer.orderTracking.status.submitted", "Order Submitted"),
          color: "bg-muted text-muted-foreground",
          icon: "Send",
        };
      case "received":
        return {
          label: t("customer.orderTracking.status.received", "Order Received"),
          color: "bg-accent text-accent-foreground",
          icon: "Clock",
        };
      case "preparing":
        return {
          label: t("customer.orderTracking.status.preparing", "Preparing"),
          color: "bg-warning text-warning-foreground",
          icon: "ChefHat",
        };
      case "ready":
        return {
          label: t("customer.orderTracking.status.ready", "Ready to Serve"),
          color: "bg-success text-success-foreground",
          icon: "CheckCircle",
        };
      case "served":
        return {
          label: t("customer.orderTracking.status.served", "Served"),
          color: "bg-primary text-primary-foreground shadow-sm",
          icon: "Utensils",
        };
      case "payment_pending":
        return {
          label: t("customer.orderTracking.status.payment_pending", "Processing Bill"),
          color: "bg-indigo-600 text-white",
          icon: "Receipt",
        };
      case "completed":
        return {
          label: t("customer.orderTracking.status.completed", "Paid & Completed"),
          color: "bg-success text-success-foreground",
          icon: "Award",
        };
      default:
        return {
          label: t("customer.orderTracking.status.unknown", "Status Pending"),
          color: "bg-muted text-muted-foreground",
          icon: "HelpCircle",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm">
      <div className="flex flex-col gap-3 md:gap-6">
        {/* Top Row: Order ID & Status */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Order Number Badge */}
            <div className="bg-primary/10 rounded-lg px-3 py-2 md:p-3 flex items-center justify-center">
              <span className="text-lg md:text-2xl font-heading font-bold text-primary">
                #{orderNumber}
              </span>
            </div>

            {/* Desktop Details (Hidden on Mobile) */}
            <div className="hidden md:flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full">
                <Icon name="Grid3x3" size={16} />
                <span>{t("customer.orderTracking.header.table", { number: tableNumber })}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full">
                <Icon name="Package" size={16} />
                <span>{t("customer.orderTracking.header.items", { count: totalItems })}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/30 rounded-full">
                <Icon name="Clock" size={16} />
                <span>{t("customer.orderTracking.header.elapsed", { time: getElapsedTime() })}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${statusConfig?.color}`}
          >
            <Icon name={statusConfig?.icon} size={16} />
            <span>{statusConfig?.label}</span>
          </div>
        </div>

        {/* Mobile Info Row (Compact, Full Words) */}
        <div className="flex md:hidden items-center justify-between w-full text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5">
            <Icon name="Grid3x3" size={14} className="text-primary" />
            <span className="font-medium">{t("customer.orderTracking.header.table", { number: tableNumber })}</span>
          </div>
          <div className="w-px h-3 bg-border"></div>
          <div className="flex items-center gap-1.5">
            <Icon name="Package" size={14} className="text-primary" />
            <span className="font-medium">{t("customer.orderTracking.header.items", { count: totalItems })}</span>
          </div>
          <div className="w-px h-3 bg-border"></div>
          <div className="flex items-center gap-1.5">
            <Icon name="Clock" size={14} className="text-primary" />
            <span className="font-medium">{getElapsedTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHeader;
