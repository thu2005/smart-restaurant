import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const QuantitySelector = ({
  quantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 99,
}) => {
  const { t } = useTranslation();

  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <span className="text-sm md:text-base font-medium text-foreground">
        {t("customer.itemDetail.quantity")}:
      </span>
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= minQuantity}
          className="w-10 h-10 md:w-12 md:h-12"
          aria-label={t("common.actions.decrease", "Decrease quantity")}
        >
          <Icon name="Minus" size={18} />
        </Button>
        <div className="w-12 md:w-16 text-center">
          <span className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            {quantity}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={quantity >= maxQuantity}
          className="w-10 h-10 md:w-12 md:h-12"
          aria-label={t("common.actions.increase", "Increase quantity")}
        >
          <Icon name="Plus" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default QuantitySelector;
