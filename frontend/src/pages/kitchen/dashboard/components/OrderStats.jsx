import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";

const OrderStats = ({ stats }) => {
  const { t } = useTranslation();
  const statCards = [
    {
      label: t('kitchen.stats.new'),
      value: stats?.newOrders,
      icon: "Bell",
      color: "accent",
      bgColor: "bg-accent/10",
    },
    {
      label: t('kitchen.stats.preparing'),
      value: stats?.preparing,
      icon: "ChefHat",
      color: "warning",
      bgColor: "bg-warning/10",
    },
    {
      label: t('kitchen.stats.ready'),
      value: stats?.ready,
      icon: "CheckCircle",
      color: "success",
      bgColor: "bg-success/10",
    },
    {
      label: t('kitchen.stats.avgTime'),
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
          className={`flex items-center gap-2 px-4 py-3 min-h-[120px] bg-${stat.color}/10 border border-gray-200 
          rounded-lg shadow-md transition-all duration-300 group hover:shadow-lg hover:border-${stat.color}/50 
          hover:scale-[1.01] ${stat.color === 'accent' ? 'border-l-4 border-l-accent' : stat.color === 'warning' ? 'border-l-4 border-l-warning' : stat.color === 'primary' ? 'border-l-4 border-l-primary' : stat.color === 'success' ? 'border-l-4 border-l-success' : ''}`}
        >
          <div
            className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-${stat.color}/10 to-${stat.color}/20 
            rounded-lg flex items-center justify-center shadow group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon
              name={stat?.icon}
              size={20}
              color={`var(--color-${stat?.color})`}
            />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1 data-text">
              {stat?.value}
            </div>
            <div className={`text-xs md:text-sm font-bold uppercase tracking-widest text-${stat.color}`}>
              {stat?.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;
