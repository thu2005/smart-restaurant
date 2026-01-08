import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setOrders(data.data || []);
        } catch (err) {
            setError(err.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-heading font-bold text-foreground">Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Icon name="ShoppingBag" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Order #{order.id.slice(-6)}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Table {order.table?.tableNumber || "N/A"}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === "COMPLETED" ? "bg-success/20 text-success" :
                                        order.status === "IN_PROGRESS" ? "bg-warning/20 text-warning" :
                                            order.status === "PENDING" ? "bg-primary/20 text-primary" :
                                                "bg-muted text-muted-foreground"
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList;
