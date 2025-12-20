import React from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const EmptyState = ({ searchQuery, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mb-4 md:mb-6">
        <Icon name="Search" size={40} color="var(--color-muted-foreground)" />
      </div>
      <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2 text-center">
        No items found
      </h3>
      <p className="text-sm md:text-base text-muted-foreground text-center mb-6 max-w-md">
        {searchQuery
          ? `We couldn't find any items matching "${searchQuery}". Try adjusting your search or filters.`
          : "No items match your current filters. Try adjusting your selection."}
      </p>
      <Button
        variant="outline"
        iconName="RotateCcw"
        iconPosition="left"
        onClick={onReset}
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default EmptyState;
