import React from "react";
import Icon from "../../../../components/AppIcon";

const OrderHeader = ({
  orderNumber,
  tableNumber,
  timestamp,
  totalItems,
  status,
  currentTime,
}) => {
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
          label: "Order Submitted",
          color: "bg-muted text-muted-foreground",
          icon: "Send",
        };
      case "received":
        return {
          label: "Order Received",
          color: "bg-accent text-accent-foreground",
          icon: "Clock",
        };
      case "preparing":
        return {
          label: "Preparing",
          color: "bg-warning text-warning-foreground",
          icon: "ChefHat",
        };
      case "ready":
        return {
          label: "Ready to Serve",
          color: "bg-success text-success-foreground",
          icon: "CheckCircle",
        };
      case "served":
        return {
          label: "Served",
          color: "bg-primary text-primary-foreground shadow-sm",
          icon: "Utensils",
        };
      case "payment_pending":
        return {
          label: "Processing Bill",
          color: "bg-indigo-600 text-white",
          icon: "Receipt",
        };
      case "completed":
        return {
          label: "Paid & Completed",
          color: "bg-success text-success-foreground",
          icon: "Award",
        };
      default:
        return {
          label: "Status Pending",
          color: "bg-muted text-muted-foreground",
          icon: "HelpCircle",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-heading font-bold text-primary">
              #{orderNumber?.split("-")?.[1]}
            </span>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1">
              Order {orderNumber}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Icon name="Grid3x3" size={16} />
                <span>Table {tableNumber}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="Package" size={16} />
                <span>{totalItems} items</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="Clock" size={16} />
                <span>{getElapsedTime()} elapsed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${statusConfig?.color}`}
          >
            <Icon name={statusConfig?.icon} size={18} />
            <span>{statusConfig?.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHeader;
