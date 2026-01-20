import React from "react";
import { useTranslation } from "react-i18next";

const OrderCard = ({ order, onAccept, onReject, onServe, onMarkCompleted, showActions = true }) => {
    const { t } = useTranslation();

    // Calculate time elapsed
    const calculateTimeElapsed = (timestamp) => {
        if (!timestamp) return "";
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return t("waiter.time.justNow");
        if (diffMins < 60) return t("waiter.time.minAgo", { count: diffMins });
        const diffHours = Math.floor(diffMins / 60);
        return t("waiter.time.hoursAgo", { hours: diffHours, minutes: diffMins % 60 });
    };

    // Calculate total price
    const calculateTotal = () => {
        if (!order.orderItems) return 0;
        return order.orderItems.reduce((sum, item) => {
            return sum + parseFloat(item.unitPrice) * item.quantity;
        }, 0);
    };

    // Determine if order is new (less than 2 minutes)
    const isNew = () => {
        if (!order.submittedAt) return false;
        const diffMs = new Date() - new Date(order.submittedAt);
        return diffMs < 120000; // 2 minutes
    };

    // Get status badge styling
    const getStatusBadge = () => {
        const statusConfig = {
            SUBMITTED: { label: t("waiter.status.SUBMITTED"), className: "bg-warning/20 text-warning" },
            RECEIVED: { label: t("waiter.status.RECEIVED"), className: "bg-success/20 text-success" },
            PREPARING: { label: t("waiter.status.PREPARING"), className: "bg-accent/20 text-accent" },
            READY: { label: t("waiter.status.READY"), className: "bg-success/30 text-success" },
            SERVED: { label: t("waiter.status.SERVED"), className: "bg-muted text-muted-foreground" },
            COMPLETED: { label: t("waiter.status.COMPLETED"), className: "bg-primary/20 text-primary border border-primary/20" },
        };

        const config = statusConfig[order.status] || {
            label: order.status,
            className: "bg-muted text-muted-foreground",
        };

        return (
            <span
                className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
            >
                {config.label}
            </span>
        );
    };

    // Get border color based on status
    const getBorderClass = () => {
        if (isNew() && order.status === "SUBMITTED") {
            return "border-l-4 border-l-error animate-pulse";
        }
        if (order.status === "READY") {
            return "border-l-4 border-l-success";
        }
        if (order.status === "COMPLETED") {
            return "border-l-4 border-l-primary opacity-75 hover:opacity-100 transition-opacity";
        }
        return "";
    };

    return (
        <div
            className={`bg-card rounded-lg border border-border shadow-warm overflow-hidden ${getBorderClass()}`}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                    {/* Table Number Badge */}
                    <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-sm md:text-base">
                        {order.table?.tableNumber || "?"}
                    </div>
                    <div>
                        <p className="font-semibold text-sm md:text-base text-foreground">
                            {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t("waiter.order.items", { count: order.orderItems?.length || 0 })}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    {getStatusBadge()}
                    <p
                        className={`text-xs mt-1 ${isNew() ? "text-error font-semibold" : "text-muted-foreground"
                            }`}
                    >
                        {calculateTimeElapsed(order.submittedAt || order.createdAt)}
                    </p>
                </div>
            </div>

            {/* Order Items - Active Batch */}
            <div className="p-4 space-y-3">
                {/* Active Items Section */}
                {(() => {
                    // For COMPLETED orders, show everything as active list for better visibility
                    const isCompleted = order.status === 'COMPLETED';
                    const activeItems = order.orderItems?.filter(item =>
                        isCompleted || !['served', 'rejected', 'completed'].includes(item.itemStatus)
                    ) || [];

                    if (activeItems.length > 0) {
                        return activeItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start justify-between pb-3 border-b border-dashed border-border last:border-0 last:pb-0"
                            >
                                <div className="flex items-start gap-2 flex-1">
                                    <span className="bg-muted px-2 py-1 rounded text-xs font-bold min-w-[40px] text-center">
                                        {item.quantity}x
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-foreground">
                                            {item.menuItem?.name || "Unknown Item"}
                                        </p>
                                        {/* Modifier rendering logic... */}
                                        {item.modifiers && item.modifiers.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {Array.isArray(item.modifiers)
                                                    ? item.modifiers.map(mod => {
                                                        // Handle both string format and object format
                                                        if (typeof mod === 'string') return mod;
                                                        if (typeof mod === 'object' && mod.name) {
                                                            return mod.quantity > 1 ? `${mod.quantity}x ${mod.name}` : mod.name;
                                                        }
                                                        return '';
                                                    }).filter(Boolean).join(", ")
                                                    : ''
                                                }
                                            </p>
                                        )}
                                        {item.specialInstructions && (
                                            <p className="text-xs text-warning italic mt-1">
                                                {t("waiter.order.note")}: {item.specialInstructions}
                                            </p>
                                        )}
                                        {/* Show status badge for item if cooking/ready */}
                                        {item.itemStatus && item.itemStatus !== 'queued' && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 uppercase font-bold
                                                ${item.itemStatus === 'ready' ? 'bg-success/20 text-success' :
                                                    item.itemStatus === 'cooking' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>
                                                {item.itemStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-foreground data-text ml-2">
                                    {parseFloat(item.unitPrice * item.quantity).toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                        ));
                    } else {
                        return <p className="text-sm text-muted-foreground text-center italic py-2">{t("waiter.order.noActiveItems")}</p>;
                    }
                })()}

                {/* Served/History Section */}
                {(() => {
                    const historyItems = order.orderItems?.filter(item => ['served', 'rejected', 'completed'].includes(item.itemStatus)) || [];

                    if (historyItems.length > 0) {
                        return (
                            <div className="mt-4 pt-4 border-t border-border">
                                <button
                                    onClick={(e) => {
                                        const el = e.currentTarget.nextElementSibling;
                                        el.classList.toggle('hidden');
                                        e.currentTarget.textContent = el.classList.contains('hidden') ? t("waiter.order.showHistory", { count: historyItems.length }) : t("waiter.order.hideHistory");
                                    }}
                                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors w-full text-center flex items-center justify-center gap-1"
                                >
                                    {t("waiter.order.showHistory", { count: historyItems.length })}
                                </button>
                                <div className="hidden space-y-3 mt-3 animate-in fade-in slide-in-from-top-2">
                                    {historyItems.map((item, index) => (
                                        <div
                                            key={`hist-${index}`}
                                            className="flex items-start justify-between pb-2 opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            <div className="flex items-start gap-2 flex-1">
                                                <span className="bg-muted/50 px-2 py-1 rounded text-xs font-medium min-w-[30px] text-center text-muted-foreground">
                                                    {item.quantity}x
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                                                        {item.menuItem?.name || "Unknown Item"}
                                                    </p>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-muted text-muted-foreground inline-block mt-0.5">
                                                        {item.itemStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Totals */}
                {/* Totals */}
                <div className="pt-2 border-t border-border space-y-1">
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {t("waiter.order.subtotal", "Subtotal")}
                        </span>
                        <span className="text-sm font-medium text-foreground data-text">
                            {calculateTotal().toLocaleString('vi-VN')}₫
                        </span>
                    </div>

                    {/* Discount (if any) */}
                    {(order.discount > 0 || order.bill?.discount > 0) && (
                        <div className="flex items-center justify-between text-success">
                            <span className="text-sm font-medium">
                                {t("waiter.bill.summary.discount", "Discount")}
                            </span>
                            <span className="text-sm font-medium data-text">
                                -{(order.discount || order.bill?.discount || 0).toLocaleString('vi-VN')}₫
                            </span>
                        </div>
                    )}

                     <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {t("waiter.order.tax", "Tax (10%)")}
                        </span>
                        <span className="text-sm font-medium text-foreground data-text">
                            {(() => {
                                const subtotal = calculateTotal();
                                const discount = order.discount || order.bill?.discount || 0;
                                const taxable = Math.max(0, subtotal - discount);
                                return (taxable * 0.1).toLocaleString('vi-VN');
                            })()}₫
                        </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-border">
                        <span className="font-semibold text-sm md:text-base text-foreground">
                            {t("waiter.order.total")}
                        </span>
                        <span className="font-bold text-base md:text-lg text-foreground data-text">
                            {(() => {
                                const subtotal = calculateTotal();
                                const discount = order.discount || order.bill?.discount || 0;
                                const taxable = Math.max(0, subtotal - discount);
                                const tax = taxable * 0.1;
                                return (taxable + tax).toLocaleString('vi-VN');
                            })()}₫
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="p-4 bg-muted/30 flex gap-2 md:gap-3">
                    {order.status === "SUBMITTED" && (
                        <>
                            <button
                                onClick={() => onReject(order)}
                                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-error text-error bg-card hover:bg-error hover:text-error-foreground rounded-lg font-semibold text-sm transition-smooth touch-target"
                            >
                                {t("waiter.action.reject")}
                            </button>
                            <button
                                onClick={() => onAccept(order)}
                                className="flex-[2] px-3 md:px-4 py-2.5 md:py-3 bg-success text-success-foreground hover:bg-success/90 rounded-lg font-semibold text-sm transition-smooth touch-target"
                            >
                                {t("waiter.action.accept")}
                            </button>
                        </>
                    )}
                    {order.status === "READY" && (
                        <button
                            onClick={() => onServe(order)}
                            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-success text-success-foreground hover:bg-success/90 rounded-lg font-semibold text-sm transition-smooth touch-target"
                        >
                            {t("waiter.action.serve")}
                        </button>
                    )}
                    {(order.status === "RECEIVED" || order.status === "PREPARING") && (
                        <button
                            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-semibold text-sm transition-smooth touch-target"
                            onClick={() => window.open("/kitchen/dashboard", "_blank")}
                        >
                            {t("waiter.action.viewKitchen")}
                        </button>
                    )}
                    {order.status === "COMPLETED" && onMarkCompleted && (
                        <button
                            onClick={() => onMarkCompleted(order)}
                            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-sm transition-smooth touch-target"
                        >
                            {t("waiter.action.markCompleted", "Mark as Completed")}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderCard;
