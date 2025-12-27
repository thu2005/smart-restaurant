import React from "react";
import Button from "../../../../components/ui/Button";

const QuickActionPanel = ({ onAction }) => {
  const actions = [
    {
      id: "menu",
      label: "Manage Menu",
      icon: "UtensilsCrossed",
      variant: "default",
      description: "Add or edit menu items",
    },
    {
      id: "kitchen",
      label: "Kitchen Display",
      icon: "ChefHat",
      variant: "secondary",
      description: "View live orders",
    },
    {
      id: "tables",
      label: "Table Setup",
      icon: "Grid3x3",
      variant: "outline",
      description: "Configure tables",
    },
    {
      id: "reports",
      label: "View Reports",
      icon: "BarChart3",
      variant: "outline",
      description: "Analytics & insights",
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
      <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4 md:mb-6">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => onAction(action?.id)}
            className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-smooth touch-target group"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-smooth">
              <Button
                variant="ghost"
                size="icon"
                iconName={action?.icon}
                className="pointer-events-none"
              />
            </div>
            <div className="text-center">
              <p className="text-sm md:text-base font-heading font-semibold text-foreground mb-1">
                {action?.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {action?.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionPanel;
