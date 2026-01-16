import React, { useState, useEffect } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";
import kitchenService from "../../../../services/kitchenService";

const OrderCard = ({ order, onStatusChange, onComplete, onRefresh }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUnreadyItems, setPendingUnreadyItems] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const orderTime = new Date(order.timestamp);
      const elapsed = Math.floor((now - orderTime) / 1000);
      setElapsedTime(elapsed);

      if (elapsed > order?.estimatedPrepTime * 60) {
        setIsOverdue(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.timestamp, order?.estimatedPrepTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, "0")}`;
  };

  const handleItemAction = async (itemId, action) => {
    try {
        setLoadingItems(prev => ({ ...prev, [itemId]: true }));
        let newStatus = 'queued';
        if (action === 'start') newStatus = 'cooking';
        if (action === 'done') newStatus = 'ready';
        
        await kitchenService.updateOrderItemStatus(order.id, itemId, newStatus);
        if (onRefresh) onRefresh();
    } catch (error) {
        console.error("Item update failed", error);
    } finally {
        setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const getStatusColor = () => {
    switch (order?.status) {
      case "new":
      case "received":
        return "bg-accent text-accent-foreground";
      case "preparing":
        return "bg-warning text-warning-foreground";
      case "ready":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = () => {
    switch (order?.status) {
      case "new":
      case "received":
        return "Received";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      default:
        return "Unknown";
    }
  };

  // Determine border color based on status and overdue
  const getBorderColor = () => {
    if (order?.status === "ready") return "border-success shadow-warm-lg"; // Ready is always green
    if (isOverdue) return "border-error shadow-warm-lg";
    
    switch (order?.status) {
      case "ready":
        return "border-success shadow-warm-lg";
      case "preparing":
        return "border-warning shadow-warm-lg";
      case "new":
      case "received":
        return "border-accent shadow-warm-lg";
      default:
        return "border-error shadow-warm-lg";
    }
  };

  return (
    <div
      className={`
      bg-card rounded-xl border-2 transition-smooth overflow-hidden
      ${getBorderColor()}
      ${order?.priority === "rush" ? "ring-2 ring-error ring-offset-2" : ""}
    `}
    >
      {/* Header Section with Status Bar */}
      <div className={`px-3 py-1.5 flex items-center justify-between ${getStatusColor()}`}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wide">
            {getStatusLabel()}
          </span>
        </div>
        <span className="text-[10px] font-medium opacity-90">
          Est: {order?.estimatedPrepTime} min
        </span>
      </div>

      <div className="p-3 md:p-3">
        {/* Order Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2"> 
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="text-lg md:text-xl font-heading font-bold text-primary tracking-tight whitespace-nowrap">
                #{order?.orderNumber}
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded-full">
                <Icon
                  name="Grid3x3"
                  size={14}
                  color="var(--color-muted-foreground)"
                />
                <span className="text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
                  {order?.tableNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-right flex-shrink-0">
            <div
              className={`
              text-xl md:text-2xl font-heading font-bold tabular-nums tracking-tight leading-none
              ${isOverdue ? "text-error animate-pulse" : "text-foreground"}
            `}
            >
              {formatTime(elapsedTime)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
              {isOverdue ? "OVERDUE" : "Elapsed"}
            </div>
          </div>
        </div>

        {/* Priority Alert */}
        {order?.priority === "rush" && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-error/10 border-l-2 border-error rounded-md mb-3">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" />
            <span className="text-xs font-bold text-error uppercase tracking-wide">
              Rush - Priority
            </span>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-2 mb-3">
          {order?.items?.map((item, index) => {
            const itemStatus = item.itemStatus || 'queued';
            const isItemLoading = loadingItems[item.id];
            
            // Adjust styling based on item status
            let statusClasses = "";
            if (itemStatus === 'cooking') statusClasses = "border-warning bg-warning/5";
            if (itemStatus === 'ready') statusClasses = "border-success bg-success/5 opacity-80";

            return (
            <div
              key={index}
              className={`relative border border-border rounded-lg p-2 bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-sm transition-smooth ${statusClasses}`}
            >
              {/* Quantity Badge - Absolute Corner */}
              <div className={`absolute top-0 left-0 px-2 py-0.5 rounded-tl-lg rounded-br-lg shadow-sm z-10 
                  ${
                    itemStatus === 'cooking' ? 'bg-warning text-warning-foreground' :
                    itemStatus === 'ready' ? 'bg-success text-success-foreground' :
                    'bg-blue-600 text-white'
                  }`}>
                <span className="text-xs font-bold leading-none">
                  {item?.quantity}×
                </span>
              </div>

              {/* Content - Centered */}
              <div className="flex flex-col items-center text-center pt-1 w-full">
                {/* Item Name */}
                <h4 className={`text-sm md:text-base font-bold text-foreground mb-1 leading-tight px-4 mt-2 ${itemStatus === 'ready' ? 'line-through decoration-success' : ''}`}>
                  {item?.name}
                </h4>

                {/* Modifiers */}
                {item?.modifiers && item?.modifiers?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                    {item?.modifiers?.map((mod, modIndex) => {
                      // Handle both string format and object format
                      let modText = '';
                      if (typeof mod === 'string') modText = mod;
                      else if (typeof mod === 'object' && mod.name) {
                        modText = mod.quantity > 1 ? `${mod.quantity}x ${mod.name}` : mod.name;
                      }
                      if (!modText) return null;
                      
                      return (
                        <span key={modIndex} className="inline-flex items-center gap-1 px-2 py-0.5 bg-background border border-border rounded-full text-[10px] font-medium text-foreground shadow-sm">
                          <Icon name="Plus" size={10} className="text-primary/70" />
                          {modText}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Special Instructions */}
                {item?.specialInstructions && (
                  <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 p-1.5 bg-warning/10 border border-warning/30 rounded mb-2">
                    <Icon name="MessageSquare" size={12} color="var(--color-warning)" className="flex-shrink-0" />
                    <p className="text-xs text-foreground font-semibold leading-tight">
                      {item?.specialInstructions}
                    </p>
                  </div>
                )}

                {/* ITEM ACTIONS - Compact */}
                {order.status !== 'ready' && (
                    <div className="flex justify-center gap-2 mt-1">
                        {/* Start Cooking Button */}
                        {itemStatus === 'queued' && (
                            <button 
                                onClick={() => handleItemAction(item.id, 'start')}
                                disabled={isItemLoading}
                                className="flex items-center gap-1 px-2 py-0.5 bg-warning/20 hover:bg-warning/30 text-warning text-[10px] font-bold uppercase rounded-full border border-warning/50 transition-colors disabled:opacity-50"
                            >
                                <Icon name="Flame" size={12} className="text-warning" />
                                {isItemLoading ? '...' : 'Cook'}
                            </button>
                        )}
                        
                        {/* Done Button */}
                        {(itemStatus === 'queued' || itemStatus === 'cooking') && (
                            <button 
                                onClick={() => handleItemAction(item.id, 'done')}
                                disabled={isItemLoading}
                                className="flex items-center gap-1 px-2 py-0.5 bg-success/20 hover:bg-success/30 text-success text-[10px] font-bold uppercase rounded-full border border-success/50 transition-colors disabled:opacity-50"
                            >
                                <Icon name="Check" size={12} className="text-success" />
                                {isItemLoading ? '...' : 'Done'}
                            </button>
                        )}
                        
                         {/* Done Badge */}
                        {itemStatus === 'ready' && (
                             <span className="flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full border border-success/20">
                                <Icon name="CheckCircle" size={12} /> Ready
                             </span>
                        )}
                    </div>
                )}
              </div>
            </div>
          )})}
        </div>

        {/* Order Notes */}
        {order?.orderNotes && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg mb-3">
            <div className="flex items-start gap-2">
              <Icon
                name="FileText"
                size={14}
                color="var(--color-accent)"
                className="flex-shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-accent uppercase tracking-wide mb-0.5">
                  Order Notes
                </p>
                <p className="text-xs text-foreground leading-snug">{order?.orderNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {order?.status === "received" ? (
             <>
               <Button
                 variant="outline" 
                 fullWidth
                 iconName="Flame"
                 iconPosition="left"
                 size="sm"
                 onClick={() => {
                     // Start all items
                     order.items.forEach(i => {
                        if ((i.itemStatus || 'queued') === 'queued') {
                            handleItemAction(i.id, 'start');
                        }
                     });
                     onStatusChange(order.id, "preparing");
                 }}
                 className="text-xs font-bold py-2 h-9 border-warning/50 text-warning hover:bg-warning/10"
               >
                 START ALL
               </Button>
               <Button
                 variant="default" 
                 fullWidth
                 iconName="CheckCircle"
                 iconPosition="left"
                 size="sm"
                 onClick={() => {
                     const unready = order.items.filter(i => (i.itemStatus || 'queued') !== 'ready');
                     if (unready.length > 0) {
                         setPendingUnreadyItems(unready);
                         setShowConfirmModal(true);
                     } else {
                         onStatusChange(order.id, "ready");
                     }
                 }}
                 className="text-xs font-bold py-2 h-9"
               >
                 READY ALL
               </Button>
             </>
          ) : order?.status === "preparing" ? (
             <Button
               variant="default" 
               fullWidth
               iconName="CheckCircle"
               iconPosition="left"
               size="sm"
               onClick={() => {
                   const unready = order.items.filter(i => (i.itemStatus || 'queued') !== 'ready');
                   if (unready.length > 0) {
                       setPendingUnreadyItems(unready);
                       setShowConfirmModal(true);
                   } else {
                       onStatusChange(order.id, "ready");
                   }
               }}
               className="text-sm font-semibold py-2 h-9"
             >
               Mark All Ready
             </Button>
          ) : (
             <div className="w-full p-2 text-center text-success font-bold bg-success/10 border border-success/20 rounded-md flex items-center justify-center gap-2 text-sm">
                 <Icon name="CheckCircle" size={16} />
                 Waiting for Waiter
             </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-card w-full max-w-sm rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-warning/10 border-b border-warning/20 flex items-center gap-3">
                  <div className="p-2 bg-warning/20 rounded-full">
                      <Icon name="AlertTriangle" size={20} className="text-warning" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg leading-tight">Unfinished Items</h3>
                      <p className="text-xs text-muted-foreground">Some items are not marked as Done</p>
                  </div>
              </div>
              
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <p className="text-sm text-foreground mb-3">Are you sure you want to mark this order as <strong>READY</strong>? The following items are still cooking/queued:</p>
                  <ul className="space-y-2 mb-2">
                      {pendingUnreadyItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/40 rounded-lg">
                              <span className="font-bold text-primary whitespace-nowrap">{item.quantity}x</span>
                              <span className="text-foreground">{item.name}</span>
                          </li>
                      ))}
                  </ul>
              </div>

              <div className="p-4 border-t border-border bg-muted/20 flex gap-3 justify-end">
                  <button 
                      onClick={() => setShowConfirmModal(false)}
                      className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                      Cancel
                  </button>
                  <Button 
                      onClick={() => {
                          pendingUnreadyItems.forEach(i => handleItemAction(i.id, 'done'));
                          onStatusChange(order.id, "ready");
                          setShowConfirmModal(false);
                      }}
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                      Mark All Ready
                  </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
