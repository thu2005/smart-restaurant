import React from "react";
import Button from "../../../../components/ui/Button";

const StickyAddToCart = ({
  totalPrice,
  quantity,
  onAddToCart,
  isAvailable,
}) => {
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[100] bg-card border-t border-border shadow-warm-lg lg:hidden">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground mb-0.5">
            Total ({quantity} {quantity === 1 ? "item" : "items"})
          </p>
          <p className="text-xl md:text-2xl font-heading font-bold text-primary data-text">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          iconName="ShoppingCart"
          iconPosition="left"
          onClick={onAddToCart}
          disabled={!isAvailable}
          className="flex-shrink-0"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default StickyAddToCart;
