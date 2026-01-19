import React from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";

const ActiveOrderCard = ({ order, onStatusUpdate }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  // Calculate order total
  const getOrderTotal = () => {
    if (order?.bill?.total) return Number(order.bill.total).toFixed(2);
    if (order?.totalAmount) return Number(order.totalAmount).toFixed(2);
    if (order?.total) return Number(order.total).toFixed(2);
    if (order?.orderItems?.length) {
      return order.orderItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0).toFixed(2);
    }
    return "0.00";
  };
  // Map backend status to frontend display status
  const mapStatus = (backendStatus) => {
    const statusMap = {
      SUBMITTED: "pending",
      RECEIVED: "preparing",
      PREPARING: "preparing",
      READY: "ready",
      SERVED: "served",
      CANCELLED: "cancelled",
      REJECTED: "rejected",
    };
    return statusMap[backendStatus] || backendStatus?.toLowerCase();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-orange-200 text-warning border-warning/20",
      preparing: "bg-blue-200 text-accent border-accent/20",
      ready: "bg-green-200 text-success border-success/20",
      overdue: "bg-red-200 text-error border-error/20",
    };
    return colors?.[status] || colors?.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "Clock",
      preparing: "ChefHat",
      ready: "CheckCircle",
      overdue: "AlertTriangle",
    };
    return icons?.[status] || "Clock";
  };

  // Calculate prep time in minutes
  const calculatePrepTime = () => {
    if (!order?.createdAt) return 0;
    const now = new Date();
    const created = new Date(order.createdAt);
    const diffMs = now - created;
    return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
  };

  const displayStatus = mapStatus(order?.status);
  const prepTime = calculatePrepTime();
  const isOverdue = displayStatus === "overdue" || prepTime > 30;

  return (
    <div
      className={`bg-card rounded-xl border ${isOverdue ? "border-error" : "border-border"
        } p-4 hover:shadow-lg transition-all duration-300 shadow-md`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="ShoppingBag" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <p className="font-heading font-semibold text-base text-foreground">
              {t('admin.dashboard.orders.details', { number: order?.orderNumber || order?.id?.slice(0, 8).toUpperCase() })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('admin.dashboard.tables.tableNumber', { number: order?.table?.tableNumber || order?.tableNumber || t('common.status.na') })}
            </p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${getStatusColor(displayStatus)}`}
        >
          <Icon name={getStatusIcon(displayStatus)} size={18} />
          <span className="capitalize">{t(`admin.dashboard.orderStatus.${displayStatus}`)}</span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {order?.orderItems?.map((orderItem) => (
          <div key={orderItem.id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <Image
                src={orderItem?.menuItem?.photos?.[0]?.url || orderItem?.menuItem?.image || "/assets/placeholder-food.jpg"}
                alt={orderItem?.menuItem?.name || t('admin.dashboard.orders.foodItem')}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {orderItem?.menuItem?.name || t('admin.dashboard.orders.unknownItem')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('admin.dashboard.orders.qty')} {orderItem?.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Icon
            name="Clock"
            size={16}
            color={
              isOverdue ? "var(--color-error)" : "var(--color-muted-foreground)"
            }
          />
          <span
            className={`text-sm font-medium ${isOverdue ? "text-error" : "text-muted-foreground"
              }`}
          >
            {prepTime} {t('common.time.min')}
          </span>
        </div>
        <p className="text-base font-semibold text-foreground">
          {formatCurrency(getOrderTotal())}
        </p>
      </div>
    </div>
  );
};

export default ActiveOrderCard;
