import React from "react";
import Icon from "../../../../components/AppIcon";

const TableVerification = ({ tableNumber, tableDetails }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Grid3x3" size={20} className="text-primary" />
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Table Information
          </h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl md:text-3xl font-bold text-primary-foreground data-text">
              {tableNumber}
            </span>
          </div>
          <div>
            <h4 className="text-lg md:text-xl font-bold text-foreground mb-1">
              Table {tableNumber}
            </h4>
            <div className="flex flex-wrap gap-y-2 gap-x-4">
              {tableDetails?.location && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon name="MapPin" size={14} />
                  <span className="text-xs md:text-sm">{tableDetails.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon name="Users" size={14} />
                <span className="text-xs md:text-sm">Up to {tableDetails?.capacity || 4} guests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${tableDetails?.status === 'AVAILABLE' ? 'bg-success' : 'bg-orange-500'}`} />
                <span className="text-xs md:text-sm font-medium capitalize">
                  {tableDetails?.status?.toLowerCase() || 'Available'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
        <Icon
          name="Info"
          size={18}
          className="text-primary/60 flex-shrink-0 mt-0.5"
        />
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Your order will be prepared and delivered directly to this table. 
          Please ensure you stay at <span className="font-semibold text-foreground">Table {tableNumber}</span> to receive your items promptly.
        </p>
      </div>
    </div>
  );
};

export default TableVerification;
