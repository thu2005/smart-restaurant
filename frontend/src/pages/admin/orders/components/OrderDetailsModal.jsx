import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";
import Button from "../../../../components/ui/Button";

const OrderDetailsModal = ({ order, onClose, onStatusUpdate, onRefresh }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
            RECEIVED: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
            PREPARING: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
            READY: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
            SERVED: "bg-green-500/20 text-green-700 dark:text-green-400",
            COMPLETED: "bg-success/20 text-success",
            CANCELLED: "bg-error/20 text-error",
        };
        return statusColors[status] || "bg-muted text-muted-foreground";
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            PENDING: "Clock",
            RECEIVED: "CheckCircle",
            PREPARING: "ChefHat",
            READY: "Bell",
            SERVED: "UtensilsCrossed",
            COMPLETED: "CheckCircle2",
            CANCELLED: "XCircle",
        };
        return statusIcons[status] || "Circle";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount || 0);
    };

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        try {
            await onStatusUpdate(order.id, newStatus);
            await onRefresh();
            onClose();
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getNextStatusOptions = (currentStatus) => {
        const statusFlow = {
            PENDING: ["RECEIVED", "CANCELLED"],
            RECEIVED: ["PREPARING", "CANCELLED"],
            PREPARING: ["READY", "CANCELLED"],
            READY: ["SERVED", "CANCELLED"],
            SERVED: ["COMPLETED"],
            COMPLETED: [],
            CANCELLED: [],
        };
        return statusFlow[currentStatus] || [];
    };

    const nextStatusOptions = getNextStatusOptions(order.status);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Order Details
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Order #{order.id?.slice(-8) || "N/A"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        disabled={isUpdating}
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        <Icon name={getStatusIcon(order.status)} size={16} />
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Table Number
                                </label>
                                <p className="text-foreground font-medium mt-1">
                                    {order.table?.tableNumber || "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Order Date
                                </label>
                                <p className="text-foreground mt-1">
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {order.customerName && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Customer Name
                                    </label>
                                    <p className="text-foreground mt-1">
                                        {order.customerName}
                                    </p>
                                </div>
                            )}
                            {order.customerPhone && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Customer Phone
                                    </label>
                                    <p className="text-foreground mt-1">
                                        {order.customerPhone}
                                    </p>
                                </div>
                            )}
                            {order.specialInstructions && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Special Instructions
                                    </label>
                                    <p className="text-foreground mt-1 text-sm">
                                        {order.specialInstructions}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Items Section */}
                    <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Order Items
                        </h3>
                        <div className="space-y-3">
                            {order.orderItems?.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-muted/30 rounded-lg p-4 flex items-start justify-between"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg font-semibold text-foreground">
                                                {item.quantity}x
                                            </span>
                                            <h4 className="font-medium text-foreground">
                                                {item.menuItem?.name || "Item"}
                                            </h4>
                                        </div>
                                        {item.menuItem?.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {item.menuItem.description}
                                            </p>
                                        )}
                                        {item.specialInstructions && (
                                            <div className="flex items-start gap-2 mt-2 text-sm">
                                                <Icon
                                                    name="MessageSquare"
                                                    size={14}
                                                    className="text-muted-foreground mt-0.5"
                                                />
                                                <p className="text-muted-foreground italic">
                                                    {item.specialInstructions}
                                                </p>
                                            </div>
                                        )}
                                        {item.modifiers && item.modifiers.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Modifiers:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.modifiers.map((mod, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-background rounded text-xs"
                                                        >
                                                            {mod.name}
                                                            {mod.price > 0 &&
                                                                ` (+${formatCurrency(
                                                                    mod.price
                                                                )})`}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="font-semibold text-foreground">
                                            {formatCurrency(item.subtotal)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Total Section */}
                    <div className="border-t border-border pt-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal || order.total)}</span>
                            </div>
                            {order.tax > 0 && (
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Tax</span>
                                    <span>{formatCurrency(order.tax)}</span>
                                </div>
                            )}
                            {order.discount > 0 && (
                                <div className="flex items-center justify-between text-success">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Section */}
                    {nextStatusOptions.length > 0 && (
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold text-foreground mb-3">
                                Update Status
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {nextStatusOptions.map((status) => (
                                    <Button
                                        key={status}
                                        variant={
                                            status === "CANCELLED"
                                                ? "outline"
                                                : "primary"
                                        }
                                        onClick={() => handleStatusChange(status)}
                                        disabled={isUpdating}
                                        iconName={
                                            isUpdating ? "Loader2" : getStatusIcon(status)
                                        }
                                        className={
                                            isUpdating
                                                ? "animate-spin"
                                                : ""
                                        }
                                    >
                                        {status === "CANCELLED"
                                            ? "Cancel Order"
                                            : `Mark as ${status}`}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
