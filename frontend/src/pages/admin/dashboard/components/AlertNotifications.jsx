import React from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const AlertNotifications = ({ alerts, onDismiss, onViewDetails }) => {
  const getAlertIcon = (severity) => {
    const icons = {
      critical: "AlertTriangle",
      warning: "AlertCircle",
      info: "Info",
    };
    return icons?.[severity] || "Bell";
  };

  const getAlertColor = (severity) => {
    const colors = {
      critical: "bg-error/10 border-error text-error",
      warning: "bg-warning/10 border-warning text-warning",
      info: "bg-accent/10 border-accent text-accent",
    };
    return colors?.[severity] || colors?.info;
  };

  if (alerts?.length === 0) return null;

  return (
    <div className="space-y-3 md:space-y-4">
      {alerts?.map((alert) => (
        <div
          key={alert?.id}
          className={`rounded-lg border-2 p-3 md:p-4 ${getAlertColor(
            alert?.severity
          )}`}
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0">
              <Icon
                name={getAlertIcon(alert?.severity)}
                size={24}
                color="currentColor"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-heading font-semibold mb-1">
                {alert?.title}
              </p>
              <p className="text-xs md:text-sm opacity-90 mb-3">
                {alert?.message}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(alert?.id)}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(alert?.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertNotifications;
