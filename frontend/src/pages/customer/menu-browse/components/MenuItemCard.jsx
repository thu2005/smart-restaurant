import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Image from "../../../../components/AppImage";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const MenuItemCard = ({ item, onQuickAdd, onItemClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getAvailabilityConfig = (status) => {
    const configs = {
      available: {
        color: "text-success",
        bg: "bg-success/10",
        label: t("customer.menu.item.availableNow", "Available"),
        icon: "CheckCircle2",
      },
      "low-stock": {
        color: "text-warning",
        bg: "bg-warning/10",
        label: t("customer.menu.item.lowStock", "Low Stock"),
        icon: "AlertCircle",
      },
      "sold-out": {
        color: "text-error",
        bg: "bg-error/10",
        label: t("customer.menu.item.soldOut", "Sold Out"),
        icon: "XCircle",
      },
    };
    return configs?.[status] || configs?.available;
  };

  const availabilityConfig = getAvailabilityConfig(item?.availability);

  const handleCardClick = () => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(`/customer/menu-item-detail/${item?.id}`);
    }
  };

  const handleQuickAdd = (e) => {
    e?.stopPropagation();
    if (item?.availability !== "sold-out") {
      onQuickAdd(item);
    }
  };

  return (
    <div
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-warm-md transition-smooth cursor-pointer group w-full min-w-0"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item?.image}
          alt={item?.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
          <div
            className={`${availabilityConfig?.bg} ${availabilityConfig?.color} px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium backdrop-blur-sm bg-opacity-90`}
          >
            <Icon name={availabilityConfig?.icon} size={14} />
            <span>{availabilityConfig?.label}</span>
          </div>

          <div className="flex flex-col gap-1 items-end">
            {item?.isPopular && (
              <div className="bg-accent text-accent-foreground px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium shadow-sm">
                <Icon name="TrendingUp" size={14} />
                <span>{t("customer.menu.categories.popular")}</span>
              </div>
            )}
            {item?.isChefRecommended && (
              <div
                className="bg-primary text-primary-foreground p-1.5 rounded-md shadow-sm"
                title={t("customer.menu.filters.chefRecommended")}
              >
                <Icon name="ChefHat" size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base md:text-lg font-heading font-semibold text-foreground line-clamp-2 flex-1">
            {item?.name}
          </h3>
          <span className="text-lg md:text-xl font-bold text-primary whitespace-nowrap data-text">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(item?.price)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item?.description}
        </p>

        <div className="flex items-center gap-3 mb-3 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon name="Star" size={16} color="var(--color-warning)" />
            <span className="font-medium data-text">
              {item?.rating?.toFixed(1)}
            </span>
            <span>({item?.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Clock" size={16} />
            <span>
              {t("customer.menu.item.prepTime", { time: item?.prepTime })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            onClick={handleCardClick}
            className="flex-1"
          >
            {t("customer.menu.item.viewDetails")}
          </Button>
          <Button
            variant="default"
            size="icon"
            iconName="Plus"
            onClick={handleQuickAdd}
            disabled={item?.availability === "sold-out"}
            aria-label={t("customer.menu.item.addToCart") + ` ${item?.name}`}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
