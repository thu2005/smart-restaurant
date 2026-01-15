import React from "react";
import Image from "../../../../components/AppImage";

import Button from "../../../../components/ui/Button";

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(item?.cartId, newQuantity);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={item?.image}
            alt={item?.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-foreground line-clamp-2">
              {item?.name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              iconName="Trash2"
              onClick={() => onRemove(item?.cartId)}
              className="flex-shrink-0 text-error hover:bg-error/10"
              aria-label={`Remove ${item?.name}`}
            />
          </div>

          {item?.modifiers && item?.modifiers?.length > 0 && (
            <div className="mb-3">
              {item?.modifiers?.map((modifier, index) => (
                <p
                  key={index}
                  className="text-xs md:text-sm text-muted-foreground"
                >
                  {modifier?.name}:{" "}
                  <span className="font-medium text-foreground">
                    {modifier?.value}
                  </span>
                </p>
              ))}
            </div>
          )}

          {item?.specialInstructions && (
            <div className="mb-3 p-2 bg-muted/50 rounded-md">
              <p className="text-xs md:text-sm text-foreground">
                <span className="font-medium">Note:</span>{" "}
                {item?.specialInstructions}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2 md:gap-3 bg-muted rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                iconName="Minus"
                onClick={() => handleQuantityChange(item?.quantity - 1)}
                disabled={item?.quantity <= 1}
                className="h-8 w-8 md:h-10 md:w-10 touch-target"
                aria-label="Decrease quantity"
              />
              <span className="text-base md:text-lg font-semibold text-foreground min-w-[2rem] text-center data-text">
                {item?.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                iconName="Plus"
                onClick={() => handleQuantityChange(item?.quantity + 1)}
                className="h-8 w-8 md:h-10 md:w-10 touch-target"
                aria-label="Increase quantity"
              />
            </div>

            <div className="text-right">
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-primary data-text">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price * item?.quantity)}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground data-text">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price)} each
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
