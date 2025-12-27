import React from "react";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";

const TopSellingItems = ({ items }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Top Selling Items
        </h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium">
          View Menu
        </button>
      </div>
      <div className="space-y-3 md:space-y-4">
        {items?.map((item, index) => (
          <div
            key={item?.id}
            className="flex items-center gap-3 md:gap-4 p-3 rounded-lg hover:bg-muted/50 transition-smooth"
          >
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary font-heading font-bold flex-shrink-0">
              {index + 1}
            </div>

            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item?.image}
                alt={item?.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-medium text-foreground truncate mb-1">
                {item?.name}
              </p>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Icon
                    name="ShoppingBag"
                    size={14}
                    color="var(--color-muted-foreground)"
                  />
                  <span className="text-xs md:text-sm text-muted-foreground data-text">
                    {item?.orderCount} orders
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={14} color="var(--color-warning)" />
                  <span className="text-xs md:text-sm text-muted-foreground data-text">
                    {item?.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm md:text-base font-semibold text-foreground data-text mb-1">
                ${item?.revenue}
              </p>
              <div className="flex items-center gap-1 text-success">
                <Icon name="TrendingUp" size={14} />
                <span className="text-xs data-text">{item?.growth}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;
