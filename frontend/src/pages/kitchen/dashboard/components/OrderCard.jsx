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

  // Determine border color based on status and overdue
  const getBorderColor = () => {
    if (!isOverdue) return "border-border shadow-warm";
    switch (order?.status) {
      case "ready":
        return "border-success shadow-warm-lg";
      case "preparing":
        return "border-warning shadow-warm-lg";
      case "new":
        return "border-accent shadow-warm-lg";
      default:
        return "border-error shadow-warm-lg";
    }
  };

  return (
    <div
      className={`
      bg-card rounded-xl border-2 transition-smooth overflow-hidden
      ${getBorderColor()}
      ${order?.priority === "rush" ? "ring-2 ring-error ring-offset-2" : ""}
    `}
    >
      {/* Header Section with Status Bar */}
      <div className={`px-4 py-2 flex items-center justify-between ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-wide">
            {getStatusLabel()}
          </span>
        </div>
        <span className="text-xs font-medium opacity-90">
          Est: {order?.estimatedPrepTime} min
        </span>
      </div>

      <div className="p-5 md:p-6">
        {/* Order Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl md:text-2xl font-heading font-bold text-primary tracking-tight">
                #{order?.orderNumber}
              </h3>
              <div className="flex items-center gap-2 px-6 py-1 bg-muted rounded-full">
                <Icon
                  name="Grid3x3"
                  size={30}
                  color="var(--color-muted-foreground)"
                />
                <span className="text-md font-semibold text-foreground">
                  TABLE {order?.tableNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-right">
            <div
              className={`
              text-3xl md:text-4xl font-heading font-bold tabular-nums tracking-tight
              ${isOverdue ? "text-error animate-pulse" : "text-foreground"}
            `}
            >
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {isOverdue ? "OVERDUE" : "Elapsed"}
            </div>
          </div>
        </div>

        {/* Priority Alert */}
        {order?.priority === "rush" && (
          <div className="flex items-center gap-2 px-4 py-3 bg-error/10 border-l-4 border-error rounded-lg mb-5">
            <Icon name="AlertCircle" size={20} color="var(--color-error)" />
            <span className="text-sm font-bold text-error uppercase tracking-wide">
              Rush Order - Priority Service
            </span>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3 mb-5">
          {order?.items?.map((item, index) => (
            <div
              key={index}
              className="relative border border-border rounded-xl p-6 bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-sm transition-smooth"
            >
              {/* Quantity Badge - Absolute Corner */}
              <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-4 py-2 rounded-tl-xl rounded-br-xl shadow-sm z-10">
                <span className="text-lg font-bold">
                  {item?.quantity}×
                </span>
              </div>

              {/* Content - Centered */}
              <div className="flex flex-col items-center text-center pt-2 w-full">
                {/* Item Name */}
                <h4 className="text-lg md:text-xl font-heading font-bold text-foreground mb-3 leading-tight">
                  {item?.name}
                </h4>

                {/* Modifiers */}
                {item?.modifiers && item?.modifiers?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {item?.modifiers?.map((mod, modIndex) => {
                      // Handle both string format and object format
                      let modText = '';
                      if (typeof mod === 'string') {
                        modText = mod;
                      } else if (typeof mod === 'object' && mod.name) {
                        modText = mod.quantity > 1 ? `${mod.quantity}x ${mod.name}` : mod.name;
                      }
                      
                      if (!modText) return null;
                      
                      return (
                        <span
                          key={modIndex}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-full text-sm font-medium text-foreground shadow-sm"
                        >
                          <Icon name="Plus" size={12} className="text-primary/70" />
                          {modText}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Special Instructions */}
                {item?.specialInstructions && (
                  <div className="w-full max-w-lg mx-auto flex items-center justify-center gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg mb-4">
                    <Icon
                      name="MessageSquare"
                      size={18}
                      color="var(--color-warning)"
                      className="flex-shrink-0"
                    />
                    <p className="text-sm text-foreground font-semibold leading-relaxed">
                      {item?.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Allergens */}
                {item?.allergens && item?.allergens?.length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-error/10 border border-error/20 rounded-full">
                    <Icon
                      name="AlertTriangle"
                      size={16}
                      color="var(--color-error)"
                    />
                    <span className="text-xs text-error font-bold uppercase tracking-wider">
                      Allergens: {item?.allergens?.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {order?.orderNotes && (
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg mb-5">
            <div className="flex items-start gap-3">
              <Icon
                name="FileText"
                size={18}
                color="var(--color-accent)"
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-accent uppercase tracking-wide mb-1">
                  Order Notes
                </p>
                <p className="text-sm text-foreground leading-relaxed">{order?.orderNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {order?.status === "new" && (
            <Button
              variant="default"
              fullWidth
              iconName="ChefHat"
              iconPosition="left"
              onClick={() => onStatusChange(order?.id, "preparing")}
              className="text-base font-semibold py-3"
            >
              Start Preparing
            </Button>
          )}
          {order?.status === "preparing" && (
            <Button
              variant="warning"
              fullWidth
              iconName="CheckCircle"
              iconPosition="left"
              onClick={() => onStatusChange(order?.id, "ready")}
              className="text-base font-semibold py-3"
            >
              Mark as Ready
            </Button>
          )}
          {order?.status === "ready" && (
            <Button
              variant="success"
              fullWidth
              iconName="Check"
              iconPosition="left"
              onClick={() => onComplete(order?.id)}
              className="text-base font-semibold py-3"
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
