import React from "react";
import Icon from "../../../../components/AppIcon";
import Image from "../../../../components/AppImage";

const OrderHistoryItem = ({ order }) => {
  const { orderNumber, completedAt, payment, orderItems, table, restaurant } = order;
  const total = payment?.total || 0;
  // If no payment record, fallback to bill or 0 (though completed orders should have payment)
  
  // Format items summary
  const itemsText = orderItems.map(item => `${item.quantity}x ${item.menuItem?.name}`).join(", ");
  const firstItemPhoto = orderItems[0]?.menuItem?.photos?.[0]?.url;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-warm transition-smooth group relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header: Order #, Status, Date */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon name="ShoppingBag" size={20} />
             </div>
             <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                    Order #{orderNumber}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icon name="MapPin" size={12} />
                    {restaurant?.name} • {table?.location} (Table {table?.tableNumber})
                </p>
             </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
             <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-success/10 text-success border border-success/20">
                Completed
             </span>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                {new Date(completedAt).toLocaleDateString("vi-VN", { 
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })}
             </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Content: Image + Items Summary + Total */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
           {/* Thumbnail of first item */}
           <div className="w-full md:w-36 h-36 md:h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
              {firstItemPhoto ? (
                  <Image 
                    src={firstItemPhoto} 
                    alt="Order item" 
                    className="w-full h-full object-cover"
                  />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Icon name="Utensils" size={24} />
                  </div>
              )}
           </div>

           {/* Items List (truncated) */}
           <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground mb-1">Items Ordered:</p>
               <p className="text-sm text-muted-foreground line-clamp-2">
                  {itemsText}
               </p>
               {orderItems.length > 3 && (
                   <span className="text-xs text-primary mt-1 inline-block">
                       +{orderItems.length - 3} more items
                   </span>
               )}
           </div>

           {/* Total Price */}
           <div className="text-left md:text-right flex-shrink-0 mt-2 md:mt-0">
              <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
              <p className="font-heading font-bold text-xl text-primary data-text">
                  {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                  }).format(total)}
              </p>
              <p className="text-xs text-muted-foreground">
                 Paid via {payment?.method || 'CASH'}
              </p>
           </div>
        </div>

        {/* Actions */}
        {/* <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" iconName="Repeat">Reorder</Button>
            <Button variant="outline" size="sm" iconName="FileText">Receipt</Button>
        </div> */}
      </div>
    </div>
  );
};

export default OrderHistoryItem;
