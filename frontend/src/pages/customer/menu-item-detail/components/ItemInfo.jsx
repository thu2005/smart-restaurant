import React from "react";
import Icon from "../../../../components/AppIcon";

const ItemInfo = ({ item }) => {
  const getAvailabilityColor = (status) => {
    switch (status) {
      case "available":
        return "text-success bg-success/10";
      case "low-stock":
        return "text-warning bg-warning/10";
      case "sold-out":
        return "text-error bg-error/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getAvailabilityText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "low-stock":
        return "Low Stock";
      case "sold-out":
        return "Sold Out";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
            {item?.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Icon
                name="Star"
                size={16}
                color="var(--color-warning)"
                className="fill-current"
              />
              <span className="text-sm md:text-base font-medium text-foreground data-text">
                {item?.rating}
              </span>
              <span className="text-sm md:text-base text-muted-foreground">
                ({item?.reviewCount} reviews)
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-md text-xs md:text-sm font-medium ${getAvailabilityColor(
                item?.availability
              )}`}
            >
              {getAvailabilityText(item?.availability)}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-primary data-text">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.basePrice || item?.price || 0)}
          </div>
        </div>
      </div>
      <p className="text-sm md:text-base lg:text-lg text-foreground leading-relaxed">
        {item?.description}
      </p>
      <div className="flex items-center gap-4 md:gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="Clock" size={18} color="var(--color-muted-foreground)" />
          <span className="text-sm md:text-base text-muted-foreground">
            {item?.prepTime} mins
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Flame" size={18} color="var(--color-muted-foreground)" />
          <span className="text-sm md:text-base text-muted-foreground">
            {item?.calories} cal
          </span>
        </div>
        {item?.isSpicy && (
          <div className="flex items-center gap-2">
            <Icon name="Flame" size={18} color="var(--color-error)" />
            <span className="text-sm md:text-base text-error font-medium">
              Spicy
            </span>
          </div>
        )}
      </div>
      {item?.allergens && item?.allergens?.length > 0 && (
        <div className="p-3 md:p-4 bg-warning/10 border border-warning/30 rounded-lg md:rounded-xl">
          <div className="flex items-start gap-2">
            <Icon
              name="AlertTriangle"
              size={20}
              color="var(--color-warning)"
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-medium text-warning mb-1">
                Allergen Information
              </p>
              <p className="text-sm md:text-base text-foreground">
                Contains: {item?.allergens?.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemInfo;
