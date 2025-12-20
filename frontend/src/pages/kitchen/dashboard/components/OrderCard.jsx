import React, { useState, useEffect } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const OrderCard = ({ order, onStatusChange, onComplete }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const orderTime = new Date(order.timestamp);
      const elapsed = Math.floor((now - orderTime) / 1000);
      setElapsedTime(elapsed);

      if (elapsed > order?.estimatedPrepTime * 60) {
        setIsOverdue(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.timestamp, order?.estimatedPrepTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, "0")}`;
  };

  const getStatusColor = () => {
    switch (order?.status) {
      case "new":
        return "bg-accent text-accent-foreground";
      case "preparing":
        return "bg-warning text-warning-foreground";
      case "ready":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = () => {
    switch (order?.status) {
      case "new":
        return "New Order";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready to Serve";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={`
      bg-card rounded-lg border-2 transition-smooth
      ${isOverdue ? "border-error shadow-warm-lg" : "border-border shadow-warm"}
      ${order?.priority === "rush" ? "ring-2 ring-error ring-offset-2" : ""}
    `}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-xl md:text-2xl font-heading font-bold text-primary">
                #{order?.orderNumber}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name="Grid3x3"
                  size={16}
                  color="var(--color-muted-foreground)"
                />
                <span className="text-sm md:text-base font-medium text-foreground">
                  Table {order?.tableNumber}
                </span>
              </div>
              <div
                className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
                ${getStatusColor()}
              `}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {getStatusLabel()}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`
              text-2xl md:text-3xl font-heading font-bold data-text
              ${isOverdue ? "text-error" : "text-foreground"}
            `}
            >
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">
              Est: {order?.estimatedPrepTime} min
            </div>
          </div>
        </div>

        {order?.priority === "rush" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-error/10 rounded-md mb-4">
            <Icon name="AlertCircle" size={18} color="var(--color-error)" />
            <span className="text-sm font-medium text-error">
              Rush Order - Priority Service
            </span>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {order?.items?.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {item?.quantity}x
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-medium text-foreground mb-1">
                  {item?.name}
                </h4>
                {item?.modifiers && item?.modifiers?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {item?.modifiers?.map((mod, modIndex) => (
                      <span
                        key={modIndex}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-background rounded text-xs text-muted-foreground"
                      >
                        <Icon name="Plus" size={12} />
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
                {item?.specialInstructions && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-warning/10 rounded border border-warning/20">
                    <Icon
                      name="MessageSquare"
                      size={14}
                      color="var(--color-warning)"
                      className="flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-warning font-medium">
                      {item?.specialInstructions}
                    </p>
                  </div>
                )}
                {item?.allergens && item?.allergens?.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Icon
                      name="AlertTriangle"
                      size={14}
                      color="var(--color-error)"
                    />
                    <span className="text-xs text-error font-medium">
                      Allergens: {item?.allergens?.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {order?.orderNotes && (
          <div className="p-3 bg-accent/10 rounded-md mb-4">
            <div className="flex items-start gap-2">
              <Icon
                name="FileText"
                size={16}
                color="var(--color-accent)"
                className="flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-medium text-accent mb-1">
                  Order Notes:
                </p>
                <p className="text-sm text-foreground">{order?.orderNotes}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {order?.status === "new" && (
            <Button
              variant="default"
              fullWidth
              iconName="ChefHat"
              iconPosition="left"
              onClick={() => onStatusChange(order?.id, "preparing")}
            >
              Start Preparing
            </Button>
          )}
          {order?.status === "preparing" && (
            <Button
              variant="success"
              fullWidth
              iconName="CheckCircle"
              iconPosition="left"
              onClick={() => onStatusChange(order?.id, "ready")}
            >
              Mark as Ready
            </Button>
          )}
          {order?.status === "ready" && (
            <Button
              variant="outline"
              fullWidth
              iconName="Check"
              iconPosition="left"
              onClick={() => onComplete(order?.id)}
            >
              Complete Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
