import React from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const EmptyState = ({ onRefresh }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="ChefHat" size={40} color="var(--color-muted-foreground)" />
      </div>
      <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
        No Active Orders
      </h3>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-6">
        All orders have been completed. The kitchen is ready for new orders.
      </p>
      <Button
        variant="outline"
        iconName="RefreshCw"
        iconPosition="left"
        onClick={onRefresh}
      >
        Refresh Orders
      </Button>
    </div>
  );
};

export default EmptyState;
