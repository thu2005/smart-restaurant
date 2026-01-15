import React from "react";
import Icon from "../../../../components/AppIcon";

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  iconColor,
  trend,
}) => {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-success";
    if (changeType === "negative") return "text-error";
    return "text-muted-foreground";
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "TrendingUp";
    if (changeType === "negative") return "TrendingDown";
    return "Minus";
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-smooth relative overflow-hidden">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1">
          <p className="text-sm md:text-base text-muted-foreground font-medium mb-1">
            {title}
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground data-text">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center`}
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon name={icon} size={24} color={iconColor} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 relative z-10">
        <div className={`flex items-center gap-1 ${getChangeColor()} bg-current/10 px-2 py-0.5 rounded-full`}>
          <Icon name={getChangeIcon()} size={14} className="stroke-2" />
          <span className="text-xs font-bold data-text">{change}</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">vs last period</span>
      </div>

      {/* Decorative background accent */}
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] pointer-events-none transform rotate-12 z-0">
        <Icon name={icon} size={120} color="currentColor" />
      </div>
    </div >
  );
};

export default MetricCard;
