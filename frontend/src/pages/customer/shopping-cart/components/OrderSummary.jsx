import React from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import Icon from "../../../../components/AppIcon";

const OrderSummary = ({ subtotal, tax, total, itemCount, estimatedTime }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  // Tax is calculated on the final bill, not here
  const calculatedTotal = subtotal;

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm">
      <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-4 md:mb-6">
        {t("customer.cart.summary.title", "Order Summary")}
      </h2>
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base text-muted-foreground">
            {t("customer.cart.summary.items", { count: itemCount })}
          </span>
          <span className="text-sm md:text-base font-medium text-foreground data-text">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="border-t border-border pt-3 md:pt-4">
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-semibold text-foreground">
              {t("customer.cart.summary.total", "Total")}
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-primary data-text">
              {formatCurrency(calculatedTotal)}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-success/10 border border-success/20 rounded-md p-3 md:p-4 flex items-start gap-3">
        <Icon
          name="Clock"
          size={20}
          className="text-success flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="text-sm md:text-base font-medium text-success mb-1">
            {t("customer.cart.summary.estimatedTime", "Estimated Prep Time")}
          </p>
          <p className="text-xs md:text-sm text-foreground">
            {t("customer.cart.summary.timeRange", { min: estimatedTime?.min || 20, max: estimatedTime?.max || 30 })}
          </p>
        </div>
      </div>
    </div>
  );
};


export default OrderSummary;
