import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const AlertNotifications = ({ alerts, onDismiss, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      critical: "bg-error/10 border-error/50 text-error",
      warning: "bg-warning/10 border-warning/50 text-warning",
      info: "bg-accent/10 border-accent/50 text-accent",
    };
    return colors?.[severity] || colors?.info;
  };

  if (!alerts || alerts.length === 0) return null;

  const displayedAlerts = isExpanded ? alerts : alerts.slice(0, 2);
  const remainingCount = alerts.length - 2;

  return (
    <div className="space-y-3 md:space-y-4">
      {displayedAlerts.map((alert) => (
        <div
          key={alert?.id}
          className={`rounded-lg border-2 p-3 md:p-4 ${getAlertColor(
            alert?.severity
          )} animate-in fade-in slide-in-from-top-2 duration-300`}
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 mt-0.5">
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
                  className="bg-transparent border-current hover:bg-current/10"
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(alert?.id)}
                  className="hover:bg-current/10"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {alerts.length > 2 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full hover:bg-muted/50"
          >
            {isExpanded ? (
              <>
                Show Less <Icon name="ChevronUp" size={16} />
              </>
            ) : (
              <>
                See {remainingCount} More Alerts <Icon name="ChevronDown" size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertNotifications;
