import React from "react";
import Icon from "../../../../components/AppIcon";

const OrderTimeline = ({
  items,
  overallProgress,
  estimatedReadyTime,
  currentTime,
}) => {
  const getTimeRemaining = () => {
    const remaining = Math.floor((estimatedReadyTime - currentTime) / 1000);
    if (remaining <= 0) return "Ready now";
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs?.toString()?.padStart(2, "0")}`;
  };

  const milestones = [
    {
      label: "Order Received",
      icon: "CheckCircle",
      completed: true,
    },
    {
      label: "Preparation Started",
      icon: "ChefHat",
      completed: items?.some(
        (item) => item?.status === "preparing" || item?.status === "ready"
      ),
    },
    {
      label: "Items Ready",
      icon: "Package",
      completed: items?.every((item) => item?.status === "ready"),
    },
    {
      label: "Ready to Serve",
      icon: "Utensils",
      completed: false,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">
          Order Progress
        </h2>
        <div className="text-right">
          <div className="text-2xl font-heading font-bold text-primary data-text">
            {getTimeRemaining()}
          </div>
          <div className="text-xs text-muted-foreground">
            Estimated ready time
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-primary data-text">
            {overallProgress}%
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-success transition-smooth"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-6">
          {milestones?.map((milestone, index) => (
            <div key={index} className="relative flex items-start gap-4">
              <div
                className={`
                  relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${
                    milestone?.completed
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                <Icon name={milestone?.icon} size={16} />
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`text-sm md:text-base font-medium ${
                    milestone?.completed
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {milestone?.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
