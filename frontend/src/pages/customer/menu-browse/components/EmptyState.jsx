import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const EmptyState = ({ searchQuery, onReset }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mb-4 md:mb-6">
        <Icon name="Search" size={40} color="var(--color-muted-foreground)" />
      </div>
      <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2 text-center">
        {t("customer.menu.search.noResults")}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground text-center mb-6 max-w-md">
        {searchQuery
          ? t("customer.menu.search.noResultsWithQuery", { query: searchQuery })
          : t("customer.menu.search.noResultsFilters")}
      </p>
      <Button
        variant="outline"
        iconName="RotateCcw"
        iconPosition="left"
        onClick={onReset}
      >
        {t("customer.menu.empty.action", "Reset Filters")}
      </Button>
    </div>
  );
};

export default EmptyState;
