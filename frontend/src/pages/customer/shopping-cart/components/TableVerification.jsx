import React from "react";
import Icon from "../../../../components/AppIcon";

const TableVerification = ({ tableNumber, onEdit }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Grid3x3" size={20} className="text-primary" />
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Table Information
          </h3>
        </div>
        <button
          onClick={onEdit}
          className="text-sm md:text-base text-primary hover:text-primary/80 font-medium transition-smooth"
        >
          Change
        </button>
      </div>

      <div className="flex items-center gap-4 p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-md">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-md flex items-center justify-center">
          <span className="text-xl md:text-2xl font-bold text-primary-foreground data-text">
            {tableNumber}
          </span>
        </div>
        <div>
          <p className="text-sm md:text-base font-medium text-foreground">
            Table {tableNumber}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Main dining area
          </p>
        </div>
      </div>

      <div className="mt-3 md:mt-4 flex items-start gap-2 p-3 bg-muted/50 rounded-md">
        <Icon
          name="Info"
          size={16}
          className="text-muted-foreground flex-shrink-0 mt-0.5"
        />
        <p className="text-xs md:text-sm text-muted-foreground">
          Your order will be delivered to this table. Please verify the table
          number is correct.
        </p>
      </div>
    </div>
  );
};

export default TableVerification;
