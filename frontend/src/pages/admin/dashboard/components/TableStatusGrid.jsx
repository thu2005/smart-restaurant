import React from "react";
import Icon from "../../../../components/AppIcon";

const TableStatusGrid = ({ tables, onTableClick }) => {
  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase() || "available";
    const configs = {
      available: {
        color: "success",
        bgColor: "bg-success/10 hover:bg-success/20",
        borderColor: "border-success",
        textColor: "text-success",
        icon: "CheckCircle",
        label: "Available",
      },
      occupied: {
        color: "accent",
        bgColor: "bg-accent/10 hover:bg-accent/20",
        borderColor: "border-accent",
        textColor: "text-accent",
        icon: "Users",
        label: "Occupied",
      },
      reserved: {
        color: "warning",
        bgColor: "bg-warning/10 hover:bg-warning/20",
        borderColor: "border-warning",
        textColor: "text-warning",
        icon: "Clock",
        label: "Reserved",
      },
      cleaning: {
        color: "muted-foreground",
        bgColor: "bg-secondary/20 hover:bg-secondary/30",
        borderColor: "border-secondary",
        textColor: "text-muted-foreground",
        icon: "Sparkles",
        label: "Cleaning",
      },
    };
    return configs[normalizedStatus] || configs.available;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-heading font-bold text-foreground">
            Table Status
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of the dining floor
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-success">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables?.map((table) => {
          const config = getStatusConfig(table.status);
          const activeOrders = table._count?.orders || 0;

          return (
              <button
                key={table.id}
                onClick={() => onTableClick && onTableClick(table)}
                className={`
                  relative flex flex-col items-center justify-center shadow-md
                  h-40 w-40 p-4 rounded-md border-[1.2px] transition-all duration-300
                  hover:shadow-lg hover:-translate-y-0.5 outline-none
                  bg-gradient-to-br
                  ${table.status?.toLowerCase() === 'occupied'
                    ? 'from-blue-50 to-blue-200'
                    : table.status?.toLowerCase() === 'reserved'
                      ? 'from-orange-50 to-orange-200'
                      : table.status?.toLowerCase() === 'cleaning'
                        ? 'from-gray-50 to-gray-200'
                        : 'from-green-50 to-green-200'}
                  ${config.borderColor}
                `}
              >
              {/* Active Orders Badge - Top Right */}
              {activeOrders > 0 && (
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white z-10">
                  {activeOrders}
                </div>
              )}

              {/* Center Icon */}
              <div className={`mb-2 ${config.textColor}`}>
                <Icon name={config.icon} size={24} />
              </div>

              <div className="text-center w-full">
                <h4 className={`font-bold text-base mb-1 ${config.textColor}`}>
                  Table {table.tableNumber}
                </h4>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${table.status?.toLowerCase() === 'occupied'
                    ? 'bg-blue-100 text-blue-700'
                    : table.status?.toLowerCase() === 'reserved'
                      ? 'bg-orange-100 text-orange-700'
                      : table.status?.toLowerCase() === 'cleaning'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-green-100 text-green-700'
                  }`}>
                  {config.label}
                </span>

                {table.capacity && (
                  <div className="flex items-center justify-center gap-1.5 text-gray-600 mt-2">
                    <Icon name="Users" size={14} />
                    <span className="text-xs font-semibold">{table.capacity} Seats</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {!tables?.length && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-muted">
            <Icon name="Grid3x3" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tables found. Add tables to see them here.</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-border">
        {["available", "occupied", "reserved", "cleaning"].map(status => {
          const conf = getStatusConfig(status);
          return (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${conf.textColor.replace('text-', 'bg-')}`} />
              <span className="text-sm font-medium text-muted-foreground capitalize">{status}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default TableStatusGrid;
