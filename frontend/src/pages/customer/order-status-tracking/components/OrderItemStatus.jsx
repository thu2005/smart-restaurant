import React from "react";
import Image from "../../../../components/AppImage";
import Icon from "../../../../components/AppIcon";

const OrderItemStatus = ({ item, currentTime }) => {
  const getStatusConfig = () => {
    switch (item?.status) {
      case "received":
        return {
          label: "Received",
          color: "bg-accent",
          textColor: "text-accent",
          bgColor: "bg-accent/10",
          borderColor: "border-accent/20",
          progress: 0,
        };
      case "preparing":
        return {
          label: "Preparing",
          color: "bg-warning",
          textColor: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20",
          progress: 50,
        };
      case "ready":
        return {
          label: "Ready",
          color: "bg-success",
          textColor: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/20",
          progress: 100,
        };
      case "served":
        return {
          label: "Served",
          color: "bg-muted",
          textColor: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted/20",
          progress: 100,
        };
      default:
        return {
          label: "Unknown",
          color: "bg-muted",
          textColor: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted/20",
          progress: 0,
        };
    }
  };

  const getTimeDisplay = () => {
    const diff = Math.floor((item?.estimatedTime - currentTime) / 1000);
    if (diff <= 0 && item?.status === "ready") return "Ready now!";
    if (diff <= 0) return "In progress";
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `~${mins}:${secs?.toString()?.padStart(2, "0")}`;
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className={`bg-card border rounded-lg p-4 md:p-6 shadow-warm ${statusConfig?.borderColor}`}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={item?.image}
            alt={item?.imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1">
                {item?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Quantity: {item?.quantity}
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${statusConfig?.bgColor} ${statusConfig?.textColor}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${statusConfig?.color} ${
                  item?.status === "preparing" ? "animate-pulse" : ""
                }`}
              />
              {statusConfig?.label}
            </div>
          </div>

          {item?.modifiers && item?.modifiers?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item?.modifiers?.map((modifier, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                >
                  <Icon name="Plus" size={10} />
                  {modifier}
                </span>
              ))}
            </div>
          )}

          {item?.specialInstructions && (
            <div className="flex items-start gap-2 mb-3 p-2 bg-warning/10 rounded border border-warning/20">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Prepared by: {item?.preparedBy}
              </span>
              <span className={`font-medium ${statusConfig?.textColor}`}>
                {getTimeDisplay()}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${statusConfig?.color} transition-smooth`}
                style={{ width: `${statusConfig?.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemStatus;
