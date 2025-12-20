import React from "react";
import Icon from "../../../../components/AppIcon";

const OrderStats = ({ stats }) => {
  const statCards = [
    {
      label: "New Orders",
      value: stats?.newOrders,
      icon: "Bell",
      color: "accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Preparing",
      value: stats?.preparing,
      icon: "ChefHat",
      color: "warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Ready",
      value: stats?.ready,
      icon: "CheckCircle",
      color: "success",
      bgColor: "bg-success/10",
    },
    {
      label: "Avg Prep Time",
      value: `${stats?.avgPrepTime} min`,
      icon: "Clock",
      color: "primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border shadow-warm p-4 md:p-6 transition-smooth hover:shadow-warm-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}
            >
              <Icon
                name={stat?.icon}
                size={20}
                color={`var(--color-${stat?.color})`}
              />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1 data-text">
            {stat?.value}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground font-medium">
            {stat?.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;
