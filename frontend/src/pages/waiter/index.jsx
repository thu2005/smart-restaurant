import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import WaiterHeader from "./components/WaiterHeader";
import OrderTabs from "./components/OrderTabs";
import OrderCard from "./components/OrderCard";
import RejectModal from "./components/RejectModal";
import waiterService from "../../services/waiterService";
import authService from "../../services/authService";

const WaiterDashboard = () => {
    const [activeTab, setActiveTab] = useState("pending");
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [counts, setCounts] = useState({
        pending: 0,
        accepted: 0,
        ready: 0,
        tables: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [socket, setSocket] = useState(null);

    const user = authService.getCurrentUser();
    const restaurantId = user?.restaurantId;

    // Initialize WebSocket connection
    useEffect(() => {
        if (!restaurantId) return;

        const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const newSocket = io(socketUrl);

        newSocket.on("connect", () => {
            console.log("WebSocket connected");
            newSocket.emit("join_restaurant", restaurantId);
        });

        newSocket.on("new_order", (order) => {
            console.log("New order received:", order);
            if (order.status === "SUBMITTED") {
                fetchOrders();
            }
        });

        newSocket.on("order_status_update", ({ orderId, status }) => {
            console.log("Order status updated:", orderId, status);
            fetchOrders();
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [restaurantId]);

    // Fetch orders based on active tab
    useEffect(() => {
        if (activeTab !== "tables") {
            fetchOrders();
        } else {
            fetchTables();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        if (!restaurantId) return;

        setLoading(true);
        setError(null);

        try {
            let response;

            switch (activeTab) {
                case "pending":
                    response = await waiterService.getPendingOrders(restaurantId);
                    break;
                case "accepted":
                    response = await waiterService.getWaiterOrders("RECEIVED");
                    break;
                case "ready":
                    response = await waiterService.getWaiterOrders("READY");
                    break;
                default:
                    response = { data: [] };
            }

            setOrders(response.data || []);

            // Update counts
            const pendingRes = await waiterService.getPendingOrders(restaurantId);
            const acceptedRes = await waiterService.getWaiterOrders("RECEIVED");
            const readyRes = await waiterService.getWaiterOrders("READY");

            setCounts({
                pending: pendingRes.data?.length || 0,
                accepted: acceptedRes.data?.length || 0,
                ready: readyRes.data?.length || 0,
                tables: tables.length,
            });
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await waiterService.getWaiterTables();
            setTables(response.data || []);
            setCounts((prev) => ({ ...prev, tables: response.data?.length || 0 }));
        } catch (err) {
            console.error("Error fetching tables:", err);
            setError("Failed to load tables. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (order) => {
        try {
            await waiterService.acceptOrder(order.id);
            // Automatically send to kitchen after accepting
            await waiterService.sendToKitchen(order.id);
            fetchOrders();
        } catch (err) {
            console.error("Error accepting order:", err);
            alert("Failed to accept order. Please try again.");
        }
    };

    const handleRejectOrder = (order) => {
        setSelectedOrder(order);
        setRejectModalOpen(true);
    };

    const handleConfirmReject = async (reason) => {
        if (!selectedOrder) return;

        try {
            await waiterService.rejectOrder(selectedOrder.id, reason);
            fetchOrders();
        } catch (err) {
            console.error("Error rejecting order:", err);
            alert("Failed to reject order. Please try again.");
        }
    };

    const handleServeOrder = async (order) => {
        try {
            await waiterService.markAsServed(order.id);
            fetchOrders();
        } catch (err) {
            console.error("Error marking order as served:", err);
            alert("Failed to mark order as served. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <WaiterHeader />
            <OrderTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
            />

            <div className="max-w-2xl mx-auto px-4 py-6">
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground mt-4">Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && activeTab !== "tables" && (
                    <>
                        {orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No orders found</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onAccept={handleAcceptOrder}
                                    onReject={handleRejectOrder}
                                    onServe={handleServeOrder}
                                />
                            ))
                        )}
                    </>
                )}

                {!loading && !error && activeTab === "tables" && (
                    <>
                        {tables.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No assigned tables</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tables.map((tableData) => (
                                    <div
                                        key={tableData.table.id}
                                        className="bg-card rounded-lg border border-border shadow-warm p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold">
                                                    T{tableData.table.tableNumber}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {tableData.table.location || "No location"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Capacity: {tableData.table.capacity}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                {tableData.orders.length} active order(s)
                                            </span>
                                        </div>
                                        {tableData.orders.map((order) => (
                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                showActions={false}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <RejectModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleConfirmReject}
                order={selectedOrder}
            />
        </div>
    );
};

export default WaiterDashboard;
