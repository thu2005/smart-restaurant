import React from "react";
import { useNavigate } from "react-router-dom";
import Image from "../../../../components/AppImage";

import Button from "../../../../components/ui/Button";

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();
  const isReadOnly = !onUpdateQuantity || !onRemove;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || isReadOnly) return;
    onUpdateQuantity(item?.cartId, newQuantity);
  };

  const handleEditItem = () => {
    if (isReadOnly) return; // Don't allow editing in read-only mode
    navigate(`/customer/menu-item-detail/${item.menuItemId}`, {
      state: { editingItem: item }
    });
  };

  return (
    <div 
      onClick={handleEditItem}
      className={`bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm transition-smooth ${!isReadOnly ? 'hover:shadow-warm-md cursor-pointer group' : ''}`}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={item?.image}
            alt={item?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base md:text-lg lg:text-xl font-heading font-semibold text-foreground line-clamp-2">
              {item?.name}
              {!isReadOnly && (
                <span className="ml-2 text-xs font-normal text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  (Click to edit)
                </span>
              )}
            </h3>
            {!isReadOnly && (
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Trash2"
                  onClick={() => onRemove(item?.cartId)}
                  className="flex-shrink-0 text-error hover:bg-error/10"
                  aria-label={`Remove ${item?.name}`}
                />
              </div>
            )}
          </div>

          {item?.modifiers && item?.modifiers?.length > 0 && (
            <div className="mb-3">
              {item?.modifiers?.map((modifier, index) => {
                const quantity = modifier?.quantity || 1;
                const totalPrice = (modifier?.priceAdjustment || 0) * quantity;
                
                return (
                  <p
                    key={index}
                    className="text-xs md:text-sm text-muted-foreground"
                  >
                    <span className="font-medium">{modifier?.groupName}:</span>{" "}
                    {quantity > 1 && <span className="text-foreground font-semibold">x{quantity} </span>}
                    {modifier?.name}
                    {totalPrice > 0 && (
                      <span className="text-primary ml-1">
                        (+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)})
                      </span>
                    )}
                  </p>
                );
              })}
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
            {isReadOnly ? (
              // Read-only: Just show quantity without controls
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <span className="text-base md:text-lg font-semibold text-foreground data-text">
                  {item?.quantity}
                </span>
              </div>
            ) : (
              // Editable: Show quantity controls
              <div 
                className="flex items-center gap-2 md:gap-3 bg-muted rounded-md p-1"
                onClick={(e) => e.stopPropagation()}
              >
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
            )}

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
