import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    <div className="rounded-lg border border-green-700/50 p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white group transform hover:scale-105">
      <div className="flex items-start justify-between mb-3 md:mb-4 relative z-10">
        <div className="flex-1">
          <p className="text-sm md:text-base text-white/80 font-medium mb-1">
            {title}
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl font-heading font-bold">
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner-sm"
        >
          <Icon name={icon} size={24} color="white" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 relative z-10">
        <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-white">
          <Icon name={getChangeIcon()} size={14} className="stroke-2" />
          <span className="text-xs font-bold">{change}</span>
        </div>
        <span className="text-sm text-white/70 font-medium">{t('admin.dashboard.metrics.vsLastPeriod')}</span>
      </div>

      {/* Decorative background accent */}
      <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none transform rotate-12 z-0">
        <Icon name={icon} size={120} color="white" />
      </div>
    </div >
  );
};

export default MetricCard;
