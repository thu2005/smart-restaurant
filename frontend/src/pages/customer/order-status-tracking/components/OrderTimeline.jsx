import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";

const OrderTimeline = ({
  orderStatus,
  items,
  overallProgress,
  estimatedReadyTime,
  currentTime,
}) => {
  const { t } = useTranslation();

  const getTimeRemaining = () => {
    if (['served', 'payment_pending', 'completed'].includes(orderStatus)) return t("customer.orderTracking.timeline.timeRemaining.enjoy", "Enjoy your meal!");
    const remaining = Math.floor((estimatedReadyTime - currentTime) / 1000);
    if (remaining <= 0) return t("customer.orderTracking.timeline.timeRemaining.ready", "Ready now");
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs?.toString()?.padStart(2, "0")}`;
  };

  const getStep = (status) => {
    const steps = ['submitted', 'received', 'preparing', 'ready', 'served', 'payment_pending', 'completed'];
    return steps.indexOf(status);
  };

  const currentStep = getStep(orderStatus);

  const milestones = [
    {
      label: t("customer.orderTracking.timeline.steps.submitted", "Order Submitted"),
      icon: "Send",
      completed: currentStep >= 0,
    },
    {
      label: t("customer.orderTracking.timeline.steps.accepted", "Order Accepted"),
      icon: "CheckCircle",
      completed: currentStep >= 1,
    },
    {
      label: t("customer.orderTracking.timeline.steps.preparing", "Preparing"),
      icon: "ChefHat",
      completed: currentStep >= 2,
    },
    {
      label: t("customer.orderTracking.timeline.steps.ready", "Ready to Serve"),
      icon: "Bell",
      completed: currentStep >= 3,
    },
    {
      label: t("customer.orderTracking.timeline.steps.served", "Served"),
      icon: "Utensils",
      completed: currentStep >= 4,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">
          {t("customer.orderTracking.timeline.title", "Order Progress")}
        </h2>
        <div className="text-right">
          <div className="text-2xl font-heading font-bold text-primary data-text">
            {getTimeRemaining()}
          </div>
          <div className="text-xs text-muted-foreground">
            {t("customer.orderTracking.timeline.estimatedTime", "Estimated ready time")}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {t("customer.orderTracking.timeline.overallProgress", "Overall Progress")}
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
                  ${milestone?.completed
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                  }
                `}
              >
                <Icon name={milestone?.icon} size={16} />
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`text-sm md:text-base font-medium ${milestone?.completed
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
