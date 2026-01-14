import React from "react";
import { createPortal } from "react-dom";

import Button from "../../../../components/ui/Button";
import { Checkbox } from "../../../../components/ui/Checkbox";
import Select from "../../../../components/ui/Select";

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
}) => {
  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten Free" },
    { value: "dairy-free", label: "Dairy Free" },
    { value: "nut-free", label: "Nut Free" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Newest Items" },
    { value: "price", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
    { value: "orderCount", label: "Most Ordered" },
  ];

  const availabilityOptions = [
    { value: "available", label: "Available Now" },
    { value: "low_stock", label: "Low Stock" },
    { value: "sold_out", label: "Sold Out" },
    { value: "unavailable", label: "Unavailable" },
  ];

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-card shadow-warm-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            Filters
          </h2>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
            aria-label="Close filters"
          />
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              Sort By
            </h3>
            <Select
              options={sortOptions}
              value={filters?.sortBy || "createdAt"}
              onChange={(value) => onFilterChange("sortBy", value)}
              placeholder="Select sorting"
            />
          </div>

          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              Special Options
            </h3>
            <div className="space-y-2">
              <Checkbox
                label="Popular Items Only"
                checked={filters?.isPopular}
                onChange={(e) => onFilterChange("isPopular", e.target.checked)}
              />
              <Checkbox
                label="Chef Recommendations"
                checked={filters?.isChefRecommended}
                onChange={(e) =>
                  onFilterChange("isChefRecommended", e.target.checked)
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              Dietary Restrictions
            </h3>
            <div className="space-y-2">
              {dietaryOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={filters?.dietary?.includes(option?.value)}
                  onChange={(e) => {
                    const newDietary = e?.target?.checked
                      ? [...filters?.dietary, option?.value]
                      : filters?.dietary?.filter((d) => d !== option?.value);
                    onFilterChange("dietary", newDietary);
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              Availability
            </h3>
            <div className="space-y-2">
              {availabilityOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={filters?.availability?.[0] === option?.value}
                  onChange={(e) => {
                    // Single select behavior for availability
                    if (e?.target?.checked) {
                      onFilterChange("availability", [option?.value]);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex gap-3">
            <Button
              variant="outline"
              onClick={onResetFilters}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              variant="default"
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default FilterPanel;
