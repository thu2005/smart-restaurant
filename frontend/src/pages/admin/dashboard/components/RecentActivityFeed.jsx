import React from "react";
import Icon from "../../../../components/AppIcon";

const RecentActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    const icons = {
      order_completed: "CheckCircle",
      payment_received: "DollarSign",
      table_assigned: "Grid3x3",
      menu_updated: "UtensilsCrossed",
      staff_login: "UserCheck",
      system_alert: "AlertTriangle",
    };
    return icons?.[type] || "Bell";
  };

  const getActivityColor = (type) => {
    const colors = {
      order_completed: "text-success",
      payment_received: "text-primary",
      table_assigned: "text-accent",
      menu_updated: "text-warning",
      staff_login: "text-muted-foreground",
      system_alert: "text-error",
    };
    return colors?.[type] || "text-foreground";
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return activityTime?.toLocaleDateString();
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Recent Activity
        </h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium">
          View All
        </button>
      </div>
      <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div
            key={activity?.id}
            className="flex items-start gap-3 md:gap-4 p-3 rounded-lg hover:bg-muted/50 transition-smooth"
          >
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                activity?.type
              )} bg-current/10`}
            >
              <Icon
                name={getActivityIcon(activity?.type)}
                size={20}
                color="currentColor"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base text-foreground font-medium mb-1">
                {activity?.title}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                {activity?.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Icon
                  name="Clock"
                  size={14}
                  color="var(--color-muted-foreground)"
                />
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(activity?.timestamp)}
                </span>
              </div>
            </div>
            {activity?.amount && (
              <div className="text-right flex-shrink-0">
                <p className="text-sm md:text-base font-semibold text-success data-text">
                  +${activity?.amount}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
