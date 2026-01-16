import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const EmptyState = ({ onRefresh }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="ChefHat" size={40} color="var(--color-muted-foreground)" />
      </div>
      <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
        {t('kitchen.empty.title')}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-6">
        {t('kitchen.empty.description')}
      </p>
      <Button
        variant="outline"
        iconName="RefreshCw"
        iconPosition="left"
        onClick={onRefresh}
      >
        {t('kitchen.empty.action')}
      </Button>
    </div>
  );
};

export default EmptyState;
