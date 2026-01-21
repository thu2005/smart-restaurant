import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const FloatingCartButton = ({ itemCount, totalAmount }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 md:right-6 z-30">
      <Button
        variant="default"
        size="lg"
        onClick={() => navigate("/customer/shopping-cart")}
        className="shadow-warm-xl hover:shadow-warm-lg transition-smooth rounded-full px-6 py-3 md:px-8 md:py-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon name="ShoppingCart" size={24} />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs opacity-90">
              {t("customer.cart.viewCart")}
            </span>
            <span className="text-base font-bold data-text">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount || 0)}
            </span>
          </div>
        </div>
      </Button>
    </div>
  );
};

export default FloatingCartButton;
