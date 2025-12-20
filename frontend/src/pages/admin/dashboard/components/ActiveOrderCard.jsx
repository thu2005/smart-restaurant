import React from "react";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";

const ActiveOrderCard = ({ order, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-warning/10 text-warning border-warning/20",
      preparing: "bg-accent/10 text-accent border-accent/20",
      ready: "bg-success/10 text-success border-success/20",
      overdue: "bg-error/10 text-error border-error/20",
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

  const isOverdue = order?.status === "overdue" || order?.prepTime > 30;

  return (
    <div
      className={`bg-card rounded-lg border ${
        isOverdue ? "border-error" : "border-border"
      } p-3 md:p-4 hover:shadow-warm transition-smooth`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="ShoppingBag" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <p className="font-heading font-semibold text-sm md:text-base text-foreground">
              Order #{order?.orderNumber}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Table {order?.tableNumber}
            </p>
          </div>
        </div>
        <div
          className={`px-2 md:px-3 py-1 rounded-full border text-xs md:text-sm font-medium ${getStatusColor(
            order?.status
          )}`}
        >
          <div className="flex items-center gap-1">
            <Icon name={getStatusIcon(order?.status)} size={14} />
            <span className="capitalize">{order?.status}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {order?.items?.map((item, index) => (
          <div key={index} className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={item?.image}
                alt={item?.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-foreground truncate">
                {item?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Qty: {item?.quantity}
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
            className={`text-xs md:text-sm font-medium data-text ${
              isOverdue ? "text-error" : "text-muted-foreground"
            }`}
          >
            {order?.prepTime} min
          </span>
        </div>
        <p className="text-sm md:text-base font-semibold text-foreground data-text">
          ${order?.total}
        </p>
      </div>
    </div>
  );
};

export default ActiveOrderCard;
