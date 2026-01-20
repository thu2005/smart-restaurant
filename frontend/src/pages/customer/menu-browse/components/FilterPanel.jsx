import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const dietaryOptions = [
    { value: "vegetarian", label: t("customer.menu.dietary.vegetarian") },
    { value: "vegan", label: t("customer.menu.dietary.vegan") },
    { value: "gluten-free", label: t("customer.menu.dietary.glutenFree") },
    { value: "dairy-free", label: t("customer.menu.dietary.dairyFree") },
    { value: "nut-free", label: t("customer.menu.dietary.nutFree") },
  ];

  const sortOptions = [
    { value: "createdAt", label: t("customer.menu.sort.newest") },
    { value: "price", label: t("customer.menu.sort.priceLowHigh") },
    { value: "price_desc", label: t("customer.menu.sort.priceHighLow") },
    { value: "name", label: t("customer.menu.sort.nameAZ") },
    { value: "orderCount", label: t("customer.menu.sort.mostOrdered") },
  ];

  const availabilityOptions = [
    { value: "available", label: t("customer.menu.filters.availableNow") },
    { value: "low_stock", label: t("customer.menu.item.lowStock") },
    { value: "sold_out", label: t("customer.menu.item.soldOut") },
    { value: "unavailable", label: t("customer.menu.item.unavailable") },
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
            {t("customer.menu.filters.title")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
            aria-label={t("common.actions.close")}
          />
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              {t("customer.menu.filters.sortBy")}
            </h3>
            <Select
              options={sortOptions}
              value={filters?.sortBy || "createdAt"}
              onChange={(value) => onFilterChange("sortBy", value)}
              placeholder={t("customer.menu.filters.sortBy")}
            />
          </div>

          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              {t("customer.menu.filters.specialOptions")}
            </h3>
            <div className="space-y-2">
              <Checkbox
                label={t("customer.menu.filters.popularItems")}
                checked={filters?.isPopular}
                onChange={(e) => onFilterChange("isPopular", e.target.checked)}
              />
              <Checkbox
                label={t("customer.menu.filters.chefRecommended")}
                checked={filters?.isChefRecommended}
                onChange={(e) =>
                  onFilterChange("isChefRecommended", e.target.checked)
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-3">
              {t("customer.menu.filters.dietary")}
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
              {t("customer.menu.filters.availability")}
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
              {t("customer.menu.filters.reset")}
            </Button>
            <Button
              variant="default"
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="flex-1"
            >
              {t("customer.menu.filters.apply")}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default FilterPanel;
