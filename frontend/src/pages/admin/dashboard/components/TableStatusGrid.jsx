import React from "react";
import Icon from "../../../../components/AppIcon";

const TableStatusGrid = ({ tables, onTableClick }) => {
  const getTableStatusColor = (status) => {
    const colors = {
      available: "bg-success/10 border-success text-success",
      occupied: "bg-accent/10 border-accent text-accent",
      reserved: "bg-warning/10 border-warning text-warning",
      cleaning: "bg-muted border-border text-muted-foreground",
    };
    return colors?.[status] || colors?.available;
  };

  const getTableIcon = (status) => {
    const icons = {
      available: "CheckCircle",
      occupied: "Users",
      reserved: "Clock",
      cleaning: "Sparkles",
    };
    return icons?.[status] || "Grid3x3";
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Table Status
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs md:text-sm text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {tables?.map((table) => (
          <button
            key={table?.id}
            onClick={() => onTableClick(table)}
            className={`
              relative p-3 md:p-4 rounded-lg border-2 transition-smooth
              hover:shadow-warm touch-target
              ${getTableStatusColor(table?.status)}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon name={getTableIcon(table?.status)} size={24} />
              <div className="text-center">
                <p className="font-heading font-semibold text-sm md:text-base">
                  Table {table?.number}
                </p>
                <p className="text-xs capitalize mt-1">{table?.status}</p>
              </div>
              {table?.occupancyTime && (
                <div className="flex items-center gap-1 mt-1">
                  <Icon name="Clock" size={12} />
                  <span className="text-xs data-text">
                    {table?.occupancyTime}m
                  </span>
                </div>
              )}
            </div>
            {table?.orderCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                {table?.orderCount}
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-4 md:mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs md:text-sm text-muted-foreground">
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-xs md:text-sm text-muted-foreground">
            Occupied
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs md:text-sm text-muted-foreground">
            Reserved
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-xs md:text-sm text-muted-foreground">
            Cleaning
          </span>
        </div>
      </div>
    </div>
  );
};

export default TableStatusGrid;
