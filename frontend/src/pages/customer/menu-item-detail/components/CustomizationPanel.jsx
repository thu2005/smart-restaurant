import React from "react";
import Icon from "../../../../components/AppIcon";
import { Checkbox } from "../../../../components/ui/Checkbox";

const CustomizationPanel = ({
  modifiers,
  selectedModifiers,
  onModifierChange,
}) => {
  // Helpers to handle changes
  const handleSingleSelect = (groupId, optionId) => {
    onModifierChange(groupId, optionId);
  };

  const handleMultiSelect = (groupId, optionId) => {
    const currentSelected = selectedModifiers[groupId] || [];
    const newSelected = currentSelected.includes(optionId)
      ? currentSelected.filter((id) => id !== optionId)
      : [...currentSelected, optionId];
    onModifierChange(groupId, newSelected);
  };

  if (!modifiers || modifiers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {modifiers.map((group) => (
        <div key={group.id} className="space-y-3">
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            {group.name}
            {group.isRequired && <span className="text-error text-sm ml-2">*Required</span>}
          </h3>
          
          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {group.selectionType === "single" ? (
              // Single Selection (Radio-like)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {group.options?.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSingleSelect(group.id, option.id)}
                    className={`
                      w-full p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-smooth touch-target text-left
                      ${
                        selectedModifiers[group.id] === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-card"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-foreground">
                          {option.name}
                        </p>
                        {option.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {option.priceAdjustment > 0 && (
                          <span className="text-sm md:text-base font-medium text-primary data-text">
                            +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.priceAdjustment)}
                          </span>
                        )}
                        <div
                          className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-smooth
                          ${
                            selectedModifiers[group.id] === option.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }
                        `}
                        >
                          {selectedModifiers[group.id] === option.id && (
                            <Icon name="Check" size={14} color="white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // Multiple Selection (Checkbox)
              <div className="space-y-2">
                {group.options?.map((option) => (
                  <div
                    key={option.id}
                    className="p-3 md:p-4 rounded-lg md:rounded-xl border border-border bg-card hover:border-primary/50 transition-smooth"
                  >
                    <Checkbox
                      checked={(selectedModifiers[group.id] || []).includes(option.id)}
                      onChange={() => handleMultiSelect(group.id, option.id)}
                      label={
                        <div className="flex items-center justify-between gap-2 flex-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm md:text-base font-medium text-foreground">
                              {option.name}
                            </p>
                            {option.description && (
                              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                                {option.description}
                              </p>
                            )}
                          </div>
                          {option.priceAdjustment > 0 && (
                            <span className="text-sm md:text-base font-medium text-primary data-text flex-shrink-0">
                              +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.priceAdjustment)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomizationPanel;
