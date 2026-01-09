import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import orderService from "../../../services/orderService";
import { toast } from "sonner";
import OrderDetailsModal from "./components/OrderDetailsModal";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const getRestaurantId = () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            return userData.restaurantId;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const restaurantId = getRestaurantId();
            if (!restaurantId) {
                throw new Error("Restaurant ID not found. Please log in.");
            }

            const params = { restaurantId };
            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await orderService.getOrders(params);
            setOrders(response.data || []);
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Failed to load orders";
            setError(message);
            console.error("Error fetching orders:", err);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success("Order status updated");
            await fetchOrders();
        } catch (err) {
            toast.error("Failed to update order status");
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">Orders</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and track restaurant orders
                    </p>
                </div>
                <Button
                    variant="outline"
                    iconName="RefreshCw"
                    onClick={fetchOrders}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="RECEIVED">Received</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="SERVED">Served</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3">
                    <Icon name="AlertCircle" size={20} className="text-error" />
                    <p className="text-error">{error}</p>
                </div>
            )}

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm mt-2">
                        {statusFilter
                            ? `No orders with status: ${statusFilter}`
                            : "Orders will appear here once customers place them"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            Order #{order.id?.slice(-8) || "N/A"}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            <Icon name={getStatusIcon(order.status)} size={14} />
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Icon name="Grid3x3" size={16} />
                                            <span>
                                                Table: {order.table?.tableNumber || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="Calendar" size={16} />
                                            <span>{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="DollarSign" size={16} />
                                            <span className="font-semibold text-foreground">
                                                {formatCurrency(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        iconName="Eye"
                                        onClick={() => handleViewDetails(order)}
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>

                            {/* Order Items Summary */}
                            <div className="border-t border-border pt-3 mt-3">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Items ({order.orderItems?.length || 0}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {order.orderItems?.slice(0, 3).map((item, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-muted rounded text-xs"
                                        >
                                            {item.quantity}x {item.menuItem?.name || "Item"}
                                        </span>
                                    ))}
                                    {order.orderItems?.length > 3 && (
                                        <span className="px-2 py-1 bg-muted rounded text-xs">
                                            +{order.orderItems.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Status Update */}
                            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                <div className="border-t border-border pt-3 mt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {order.status === "PENDING" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleStatusUpdate(order.id, "RECEIVED")
                                                }
                                            >
                                                Mark Received
                                            </Button>
                                        )}
                                        {order.status === "RECEIVED" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleStatusUpdate(order.id, "PREPARING")
                                                }
                                            >
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status === "PREPARING" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleStatusUpdate(order.id, "READY")
                                                }
                                            >
                                                Mark Ready
                                            </Button>
                                        )}
                                        {order.status === "READY" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleStatusUpdate(order.id, "SERVED")
                                                }
                                            >
                                                Mark Served
                                            </Button>
                                        )}
                                        {order.status === "SERVED" && (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() =>
                                                    handleStatusUpdate(order.id, "COMPLETED")
                                                }
                                            >
                                                Complete Order
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedOrder(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                    onRefresh={fetchOrders}
                />
            )}
        </div>
    );
};

export default OrderList;