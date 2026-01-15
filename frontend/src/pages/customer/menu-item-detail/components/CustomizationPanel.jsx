import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";
import { Checkbox } from "../../../../components/ui/Checkbox";

const CustomizationPanel = ({
  modifiers,
  selectedModifiers,
  onModifierChange,
}) => {
  // Track quantities for ADDON type modifiers
  // Format: { groupId: { optionId: quantity } }
  const [addonQuantities, setAddonQuantities] = useState({});

  // Handle single selection (CHOICE type)
  const handleSingleSelect = (groupId, optionId) => {
    onModifierChange(groupId, optionId);
  };

  // Handle multiple selection (CHOICE type)
  const handleMultiSelect = (groupId, optionId) => {
    const currentSelected = selectedModifiers[groupId] || [];
    const newSelected = currentSelected.includes(optionId)
      ? currentSelected.filter((id) => id !== optionId)
      : [...currentSelected, optionId];
    onModifierChange(groupId, newSelected);
  };

  // Handle ADDON selection with quantity
  const handleAddonToggle = (groupId, optionId) => {
    const currentSelected = selectedModifiers[groupId] || [];
    const isSelected = currentSelected.some(
      (item) => (typeof item === 'object' ? item.id : item) === optionId
    );

    if (isSelected) {
      // Remove addon
      const newSelected = currentSelected.filter(
        (item) => (typeof item === 'object' ? item.id : item) !== optionId
      );
      onModifierChange(groupId, newSelected);
      
      // Clear quantity
      setAddonQuantities((prev) => ({
        ...prev,
        [groupId]: { ...prev[groupId], [optionId]: undefined },
      }));
    } else {
      // Add addon with quantity 1
      const newSelected = [...currentSelected, { id: optionId, quantity: 1 }];
      onModifierChange(groupId, newSelected);
      
      setAddonQuantities((prev) => ({
        ...prev,
        [groupId]: { ...prev[groupId], [optionId]: 1 },
      }));
    }
  };

  // Handle ADDON quantity change
  const handleAddonQuantityChange = (groupId, optionId, newQuantity) => {
    if (newQuantity < 1) {
      handleAddonToggle(groupId, optionId); // Remove if quantity < 1
      return;
    }

    const currentSelected = selectedModifiers[groupId] || [];
    const newSelected = currentSelected.map((item) => {
      const itemId = typeof item === 'object' ? item.id : item;
      if (itemId === optionId) {
        return { id: optionId, quantity: newQuantity };
      }
      return item;
    });

    onModifierChange(groupId, newSelected);
    setAddonQuantities((prev) => ({
      ...prev,
      [groupId]: { ...prev[groupId], [optionId]: newQuantity },
    }));
  };

  // Get addon quantity
  const getAddonQuantity = (groupId, optionId) => {
    const currentSelected = selectedModifiers[groupId] || [];
    const addon = currentSelected.find(
      (item) => (typeof item === 'object' ? item.id : item) === optionId
    );
    return typeof addon === 'object' ? addon.quantity : 1;
  };

  // Check if addon is selected
  const isAddonSelected = (groupId, optionId) => {
    const currentSelected = selectedModifiers[groupId] || [];
    return currentSelected.some(
      (item) => (typeof item === 'object' ? item.id : item) === optionId
    );
  };

  if (!modifiers || modifiers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {modifiers.map((group) => {
        const isAddonType = group.modifierType === 'addon';

        return (
          <div key={group.id} className="space-y-3">
            <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
              {group.name}
              {group.isRequired && <span className="text-error text-sm ml-2">*Required</span>}
              {isAddonType && <span className="text-muted-foreground text-sm ml-2">(Add-ons)</span>}
            </h3>
            
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {/* CHOICE - Single Selection */}
              {!isAddonType && group.selectionType === "single" && (
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
              )}

              {/* CHOICE - Multiple Selection OR ADDON */}
              {(!isAddonType && group.selectionType === "multiple") || isAddonType ? (
                <div className="space-y-2">
                  {group.options?.map((option) => {
                    const selected = isAddonType 
                      ? isAddonSelected(group.id, option.id)
                      : (selectedModifiers[group.id] || []).includes(option.id);
                    const quantity = isAddonType ? getAddonQuantity(group.id, option.id) : 1;

                    return (
                      <div
                        key={option.id}
                        className="p-3 md:p-4 rounded-lg md:rounded-xl border border-border bg-card hover:border-primary/50 transition-smooth"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Checkbox
                            checked={selected}
                            onChange={() => isAddonType 
                              ? handleAddonToggle(group.id, option.id)
                              : handleMultiSelect(group.id, option.id)
                            }
                            label={
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
                            }
                          />
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Quantity Selector for ADDON */}
                            {isAddonType && selected && (
                              <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  iconName="Minus"
                                  onClick={() => handleAddonQuantityChange(group.id, option.id, quantity - 1)}
                                  className="h-7 w-7"
                                  aria-label="Decrease quantity"
                                />
                                <span className="text-sm font-semibold text-foreground min-w-[2rem] text-center">
                                  {quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  iconName="Plus"
                                  onClick={() => handleAddonQuantityChange(group.id, option.id, quantity + 1)}
                                  className="h-7 w-7"
                                  aria-label="Increase quantity"
                                />
                              </div>
                            )}
                            
                            {/* Price */}
                            {option.priceAdjustment > 0 && (
                              <span className="text-sm md:text-base font-medium text-primary data-text">
                                +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                  option.priceAdjustment * (isAddonType && selected ? quantity : 1)
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomizationPanel;
