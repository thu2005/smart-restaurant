import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";
import Button from "../../../../components/ui/Button";
import menuService from "../../../../services/menuService";

const RelatedItems = ({ categoryId, currentId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { restaurantId: paramRestaurantId, tableId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const restaurantId =
    paramRestaurantId || localStorage.getItem("restaurantId");

  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!restaurantId || !currentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await menuService.getRelatedItems(
          restaurantId,
          currentId,
          4,
        );
        setItems(response.data || []);
      } catch (error) {
        console.error("Failed to fetch related items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [restaurantId, currentId]);

  const handleItemClick = (itemId) => {
    // Navigate to item detail with proper route
    if (restaurantId && tableId) {
      navigate(
        `/customer/menu-item-detail/${restaurantId}/${tableId}/${itemId}`,
      );
    } else {
      navigate(`/customer/menu-item-detail/${itemId}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
          {t("customer.itemDetail.relatedItems.title", "You May Also Like")}
        </h2>
        <div className="flex gap-3 md:gap-4 lg:grid lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 md:w-72 lg:w-full bg-card rounded-lg md:rounded-xl border border-border overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-muted"></div>
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  // Helper to get image URL from item
  const getItemImage = (item) => {
    if (item?.photos && item.photos.length > 0) {
      return item.photos[0].url;
    }
    return item?.imageUrl || item?.image || null;
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
        {t("customer.itemDetail.relatedItems.title", "You May Also Like")}
      </h2>
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:mx-0 lg:px-0">
        <div className="flex gap-3 md:gap-4 lg:grid lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item?.id}
              className="flex-shrink-0 w-64 md:w-72 lg:w-full bg-card rounded-lg md:rounded-xl border border-border overflow-hidden hover:shadow-warm-md transition-smooth cursor-pointer"
              onClick={() => handleItemClick(item?.id)}
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={getItemImage(item)}
                  alt={item?.name}
                  className="w-full h-full object-cover"
                />
                {item?.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-md">
                    {t("customer.itemDetail.relatedItems.new", "New")}
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 space-y-2">
                <h3 className="text-base md:text-lg font-heading font-semibold text-foreground line-clamp-2">
                  {item?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Icon
                      name="Star"
                      size={14}
                      color="var(--color-warning)"
                      className="fill-current"
                    />
                    <span className="text-sm font-medium text-foreground data-text">
                      {item?.averageRating?.toFixed(1) || item?.rating || "0.0"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({item?.reviewCount || 0})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg md:text-xl font-heading font-bold text-primary data-text">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item?.price)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleItemClick(item?.id);
                    }}
                  >
                    {t("customer.itemDetail.relatedItems.add", "Add")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedItems;
