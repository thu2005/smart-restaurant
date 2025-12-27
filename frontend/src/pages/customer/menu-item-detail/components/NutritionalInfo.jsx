import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";

const NutritionalInfo = ({ nutritionalData, ingredients }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3 md:space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border hover:border-primary/50 transition-smooth touch-target"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Info" size={20} color="var(--color-primary)" />
          </div>
          <span className="text-base md:text-lg font-heading font-semibold text-foreground">
            Nutritional Information & Ingredients
          </span>
        </div>
        <Icon
          name={isExpanded ? "ChevronUp" : "ChevronDown"}
          size={20}
          color="var(--color-muted-foreground)"
        />
      </button>
      {isExpanded && (
        <div className="p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border space-y-4 md:space-y-6">
          <div>
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3">
              Nutrition Facts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {nutritionalData?.map((item, index) => (
                <div
                  key={index}
                  className="p-3 md:p-4 bg-muted rounded-lg text-center"
                >
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">
                    {item?.label}
                  </p>
                  <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
                    {item?.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3">
              Ingredients
            </h3>
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              {ingredients?.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalInfo;
