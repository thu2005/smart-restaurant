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
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-smooth">
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
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 ${getChangeColor()}`}>
          <Icon name={getChangeIcon()} size={16} />
          <span className="text-sm font-medium data-text">{change}</span>
        </div>
        <span className="text-sm text-muted-foreground">vs last period</span>
      </div>
      {trend && (
        <div className="mt-3 md:mt-4 h-12 md:h-16">
          <div className="flex items-end justify-between h-full gap-1">
            {trend?.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-primary/20 rounded-t transition-smooth hover:bg-primary/30"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
