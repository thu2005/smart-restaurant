import React from "react";
import Icon from "../../../../components/AppIcon";

const TableStatusGrid = ({ tables, onTableClick }) => {
  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase() || "available";
    const configs = {
      available: {
        legendColor: "bg-emerald-600",
        icon: "CheckCircle",
        label: "Available",
      },
      occupied: {
        legendColor: "bg-blue-600",
        icon: "Users",
        label: "Occupied",
      },
      reserved: {
        legendColor: "bg-orange-600",
        icon: "Clock",
        label: "Reserved",
      },
      cleaning: {
        legendColor: "bg-gray-600",
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
                  h-40 w-40 p-4 rounded-xl border transition-all duration-300
                  hover:shadow-lg hover:-translate-y-1 outline-none
                  text-white overflow-hidden group
                  bg-gradient-to-br
                  ${table.status?.toLowerCase() === 'occupied'
                  ? 'from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 border-blue-500/50'
                  : table.status?.toLowerCase() === 'reserved'
                    ? 'from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700 border-orange-500/50'
                    : table.status?.toLowerCase() === 'cleaning'
                      ? 'from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 border-gray-500/50'
                      : 'from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 border-emerald-500/50'}
                `}
            >
              {/* Active Orders Badge removed as requested */}

              {/* Decorative Background Icon */}
              <div className="absolute -bottom-8 -right-8 opacity-10 transform rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Icon name={config.icon} size={100} color="white" />
              </div>

              {/* Center Icon */}
              <div className="mb-3 relative z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner-sm">
                <Icon name={config.icon} size={24} color="white" />
              </div>

              <div className="text-center w-full relative z-10">
                <h4 className="font-bold text-lg mb-2">
                  Table {table.tableNumber}
                </h4>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 shadow-sm">
                  {config.label}
                </span>

                {table.capacity && (
                  <div className="flex items-center justify-center gap-1.5 text-white/80 mt-3 font-medium">
                    <Icon name="Users" size={14} />
                    <span className="text-xs">{table.capacity} Seats</span>
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
              <div className={`w-3 h-3 rounded-full ${conf.legendColor}`} />
              <span className="text-sm font-medium text-muted-foreground capitalize">{status}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default TableStatusGrid;
