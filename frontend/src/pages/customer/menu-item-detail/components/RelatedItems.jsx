import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";
import Button from "../../../../components/ui/Button";

const RelatedItems = ({ items }) => {
  const navigate = useNavigate();

  const handleItemClick = (itemId) => {
    navigate("/menu-item-detail", { state: { itemId } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground">
        You May Also Like
      </h2>
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 lg:mx-0 lg:px-0">
        <div className="flex gap-3 md:gap-4 lg:grid lg:grid-cols-4">
          {items?.map((item) => (
            <div
              key={item?.id}
              className="flex-shrink-0 w-64 md:w-72 lg:w-full bg-card rounded-lg md:rounded-xl border border-border overflow-hidden hover:shadow-warm-md transition-smooth cursor-pointer"
              onClick={() => handleItemClick(item?.id)}
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={item?.image}
                  alt={item?.imageAlt}
                  className="w-full h-full object-cover"
                />
                {item?.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-md">
                    New
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
                      {item?.rating}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({item?.reviewCount})
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg md:text-xl font-heading font-bold text-primary data-text">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price)}
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
                    Add
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
