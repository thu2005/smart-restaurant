import React from "react";
import Icon from "../../../../components/AppIcon";
import { Checkbox } from "../../../../components/ui/Checkbox";

const CustomizationPanel = ({
  modifiers,
  selectedModifiers,
  onModifierChange,
}) => {
  const handleSizeChange = (sizeValue) => {
    onModifierChange("size", sizeValue);
  };

  const handleExtraToggle = (extraId) => {
    const currentExtras = selectedModifiers?.extras || [];
    const newExtras = currentExtras?.includes(extraId)
      ? currentExtras?.filter((id) => id !== extraId)
      : [...currentExtras, extraId];
    onModifierChange("extras", newExtras);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {modifiers?.sizes && modifiers?.sizes?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Choose Size
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {modifiers?.sizes?.map((size) => (
              <button
                key={size?.id}
                onClick={() => handleSizeChange(size?.value)}
                className={`
                  w-full p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-smooth touch-target
                  ${
                    selectedModifiers?.size === size?.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  }
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium text-foreground">
                      {size?.label}
                    </p>
                    {size?.description && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                        {size?.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {size?.priceModifier > 0 && (
                      <span className="text-sm md:text-base font-medium text-primary data-text">
                        +${size?.priceModifier?.toFixed(2)}
                      </span>
                    )}
                    <div
                      className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-smooth
                      ${
                        selectedModifiers?.size === size?.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }
                    `}
                    >
                      {selectedModifiers?.size === size?.value && (
                        <Icon name="Check" size={14} color="white" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {modifiers?.extras && modifiers?.extras?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Add Extras
          </h3>
          <div className="space-y-2">
            {modifiers?.extras?.map((extra) => (
              <div
                key={extra?.id}
                className="p-3 md:p-4 rounded-lg md:rounded-xl border border-border bg-card hover:border-primary/50 transition-smooth"
              >
                <Checkbox
                  checked={(selectedModifiers?.extras || [])?.includes(
                    extra?.id
                  )}
                  onChange={() => handleExtraToggle(extra?.id)}
                  label={
                    <div className="flex items-center justify-between gap-2 flex-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-foreground">
                          {extra?.label}
                        </p>
                        {extra?.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                            {extra?.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm md:text-base font-medium text-primary data-text flex-shrink-0">
                        +${extra?.price?.toFixed(2)}
                      </span>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationPanel;
