import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";

const TopSellingItems = ({ items }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm h-full flex flex-col max-h-[600px] relative">
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Top Selling Items
          </h3>
          <button className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium">
            View Menu
          </button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto w-full custom-scrollbar p-1">
          {items?.map((item, index) => (
            <React.Fragment key={item?.id || index}>
              <div
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-card hover:shadow-md hover:scale-[1.02] hover:ring-1 hover:ring-primary/20 transition-all duration-200 group border border-transparent cursor-pointer relative"
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}
              >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success text-white font-heading font-bold text-sm flex-shrink-0 transition-colors">
                {index + 1}
              </div>

              {/* Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/50 relative">
                {item?.image ? (
                  <Image
                    src={item.image}
                    alt={item?.name || "Menu item"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Icon name="Image" size={20} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p
                  className="text-sm font-semibold text-foreground truncate"
                  title={item?.name}
                >
                  {item?.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 min-w-[60px]">
                    <div className="flex items-center justify-center gap-1">
                      <Icon
                        name="ShoppingBag"
                        size={12}
                        color="var(--color-muted-foreground)"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item?.orderCount || 0} orders
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0 flex flex-col justify-center">
                <p className="text-sm font-bold text-foreground data-text">
                  ${((item?.revenue || 0) / 100).toFixed(2)}
                </p>
                {item?.growth > 0 && (
                  <div className="flex items-center justify-end gap-1 text-success mt-0.5">
                    <Icon name="TrendingUp" size={12} />
                    <span className="text-xs font-medium">{item?.growth}%</span>
                  </div>
                )}
              </div>
              </div>
              {index !== items.length - 1 && (
                <div style={{height: '1px', background: '#e5e7eb', margin: '0 8px 8px 8px'}}></div>
              )}
            </React.Fragment>
          ))}

          {(!items || items.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {hoveredItem && (
        <div
          className="fixed z-90 bg-popover/90 backdrop-blur-lg border border-border/50 shadow-warm-xl rounded-xl p-4 w-72 pointer-events-none ring-2 ring-primary/10 origin-center transition-transform duration-300 scale-10 animate-in fade-in"
          style={{
            top: coords.top + coords.height / 2,
            left: coords.left + coords.width / 2, 
            transform: "translate(-50%, -50%) scale(1)", 
          }}
        >
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-3 relative border border-border/50 shadow-sm">
            {hoveredItem?.image ? (
              <img
                src={hoveredItem.image}
                alt={hoveredItem?.name || "Menu item"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <Icon name="Image" size={32} />
              </div>
            )}
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold shadow-sm border border-border/50 text-foreground">
              Rank #{items.indexOf(hoveredItem) + 1}
            </div>
          </div>

          <h4 className="font-heading font-bold text-lg leading-tight mb-3 text-foreground">
            {hoveredItem.name}
          </h4>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div key="revenue" className="bg-background/50 p-2.5 rounded-lg text-center border border-border/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Revenue</p>
              <p className="font-mono text-base font-bold text-primary">${((hoveredItem.revenue || 0) / 100).toFixed(2)}</p>
            </div>
            <div key="orders" className="bg-background/50 p-2.5 rounded-lg text-center border border-border/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Orders</p>
              <p className="font-mono text-base font-bold text-foreground">{hoveredItem.orderCount || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span key="category" className="bg-primary/10 text-primary px-2 py-1 rounded-md font-semibold border border-primary/20">
              {hoveredItem?.category || 'Main Menu'}
            </span>
            {hoveredItem.growth > 0 && (
              <span key="growth" className="flex items-center gap-1 text-success font-semibold px-2 py-1 bg-success/10 rounded-md border border-success/20">
                <Icon name="TrendingUp" size={12} />
                {hoveredItem.growth}% growth
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TopSellingItems;
