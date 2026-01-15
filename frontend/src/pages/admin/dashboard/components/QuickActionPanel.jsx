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
            className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/40 shadow-sm hover:shadow-warm-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner-sm ${action.variant === 'default' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30' :
                action.variant === 'secondary' ? 'bg-secondary/10 text-secondary-foreground/80 group-hover:bg-secondary group-hover:text-secondary-foreground' :
                  'bg-muted text-muted-foreground/80 group-hover:bg-foreground group-hover:text-background'
              }`}>
              <Button
                variant="ghost"
                size="icon"
                iconName={action?.icon}
                className="pointer-events-none w-7 h-7"
              />
            </div>

            <div className="text-center relative z-10">
              <p className="text-base font-heading font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {action?.label}
              </p>
              <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                {action?.description}
              </p>
            </div>

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionPanel;
