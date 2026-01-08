import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import { useCustomerAuth } from "../../../contexts/CustomerAuthContext";
import orderService from "../../../services/orderService";

const OrderHistoryPage = () => {
    const { user, isAuthenticated } = useCustomerAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                const response = await orderService.getMyOrders();
                // Check if response structure matches expectation (response.data vs response)
                const ordersData = response.data || response;
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("Failed to load order history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
                <p className="text-muted-foreground">Please sign in to view your order history.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="History" className="text-primary" />
                Order History
            </h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Icon name="Loader2" className="animate-spin text-primary" size={32} />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center p-8 bg-card rounded-xl border border-border">
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const total = order.total || order.orderItems?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
                        const itemsCount = order.items || order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                        const date = order.createdAt || order.date || new Date().toISOString();
                        const id = order.orderNumber || order.id;

                        return (
                            <div key={order.id || id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-lg">Order #{id}</span>
                                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-bold rounded-full">
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-4">
                                        <span>{new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${Number(total).toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">{itemsCount} items</p>
                                    </div>
                                    <button className="p-2 hover:bg-muted rounded-full text-primary">
                                        <Icon name="ChevronRight" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
