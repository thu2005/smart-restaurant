import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import WaiterHeader from "./components/WaiterHeader";
import OrderTabs from "./components/OrderTabs";
import OrderCard from "./components/OrderCard";
import RejectModal from "./components/RejectModal";
import BillSummary from "./components/BillSummary";
import DiscountModal from "./components/DiscountModal";
import PaymentModal from "./components/PaymentModal";
import BillRequestToast from "./components/BillRequestToast";
import OrderDetailsModal from "./components/OrderDetailsModal";
import waiterService from "../../services/waiterService";
import authService from "../../services/authService";

const WaiterDashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("pending");
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [counts, setCounts] = useState({
        pending: 0,
        accepted: 0,
        ready: 0,
        tables: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [socket, setSocket] = useState(null);

    // Bill management state
    const [bills, setBills] = useState({});  // { orderId: billData }
    const [discountModalOpen, setDiscountModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrderForBill, setSelectedOrderForBill] = useState(null);

    // Bills list state
    const [billTab, setBillTab] = useState("ALL"); // ALL, PAID, UNPAID
    const [billList, setBillList] = useState([]);
    const [billLoading, setBillLoading] = useState(false);

    // Toast notification state
    const [billRequestNotification, setBillRequestNotification] = useState(null);

    // Order details modal state
    const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
    const [selectedOrderForView, setSelectedOrderForView] = useState(null);

    const user = authService.getCurrentUser();
    const restaurantId = user?.restaurantId;



    // Fetch bills for waiter
    const fetchBills = useCallback(async () => {
        if (!restaurantId) return;
        setBillLoading(true);
        try {
            const status = billTab === "ALL" ? undefined : billTab;
            const res = await waiterService.getBills(restaurantId, status);
            setBillList(res.data || []);
        } catch (err) {
            console.error("Failed to load bills:", err);
        } finally {
            setBillLoading(false);
        }
    }, [restaurantId, billTab]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    // Fetch orders and tables on initial mount to show badge counts after reload
    useEffect(() => {
        if (!restaurantId) return;
        fetchOrders();
        fetchTables();

        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, [restaurantId]);

    // Initialize WebSocket connection
    useEffect(() => {
        if (!restaurantId) return;

        // Socket.IO connects to base server URL (not /api)
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const socketUrl = apiUrl.replace('/api', ''); // Remove /api suffix for socket connection
        const newSocket = io(socketUrl);

        newSocket.on("connect", () => {
            console.log("Waiter WebSocket connected");
            newSocket.emit("join_restaurant", restaurantId);
        });

        newSocket.on("new_order", (order) => {
            console.log("🔔 New order received:", order);
            // Use ref to get latest fetchOrders without causing reconnection
            if (fetchOrdersRef.current) {
                fetchOrdersRef.current();
            }
        });

        newSocket.on("order_status_update", ({ orderId, status }) => {
            console.log("🔔 Order status updated:", orderId, status);
            if (fetchOrdersRef.current) {
                fetchOrdersRef.current();
            }
        });

        newSocket.on("order_items_added", ({ orderId, orderNumber, newItemsCount }) => {
            console.log("🔔 Items added to order:", orderNumber, `(+${newItemsCount} items)`);
            // Refresh to show the updated order with new items
            if (fetchOrdersRef.current) {
                fetchOrdersRef.current();
            }
        });

        newSocket.on("bill_requested", ({ orderId, orderNumber, tableNumber, billData }) => {
            console.log("💰 Bill requested:", orderNumber, "Table:", tableNumber);

            // Show toast notification
            setBillRequestNotification({
                orderId,
                orderNumber,
                tableNumber,
                total: billData.total
            });

            // Show browser notification to waiter (if permission granted)
            if (Notification.permission === "granted") {
                new Notification("Bill Requested", {
                    body: `Table ${tableNumber} - ${orderNumber} has requested the bill ($${billData.total.toFixed(2)})`,
                    icon: "/favicon.ico"
                });
            }

            // Play notification sound (optional)
            try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio notification failed:', e);
            }

            // Refresh tables view to show the bill request
            if (activeTab === "tables") {
                fetchTables();
            }
        });

        newSocket.on("payment_received", ({ orderId }) => {
            console.log("✅ Payment received for order:", orderId);

            // Show success toast notification
            toast.success("Payment Received!", {
                description: "The order has been paid successfully. You can now mark it as completed.",
                duration: 5000
            });

            // Show browser notification
            if (Notification.permission === "granted") {
                new Notification("Payment Received", {
                    body: `Payment received successfully!`,
                    icon: "/favicon.ico"
                });
            }

            // Remove bill from local state and refresh
            setBills(prev => {
                const newBills = { ...prev };
                delete newBills[orderId];
                return newBills;
            });

            // Refresh tables to update status
            if (activeTab === "tables") {
                fetchTables();
            } else {
                fetchOrders();
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [restaurantId]); // Only reconnect when restaurantId changes

    // Fetch orders based on active tab
    useEffect(() => {
        if (activeTab !== "tables") {
            fetchOrders();
        } else {
            fetchTables();
        }
    }, [activeTab]);

    // Update all badge counts
    const updateCounts = async () => {
        try {
            const [pendingRes, receivedCount, preparingCount, readyRes, tablesRes, completedRes] = await Promise.all([
                waiterService.getPendingOrders(restaurantId),
                waiterService.getWaiterOrders("RECEIVED"),
                waiterService.getWaiterOrders("PREPARING"),
                waiterService.getWaiterOrders("READY"),
                waiterService.getWaiterTables(),
                waiterService.getWaiterOrders("COMPLETED")
            ]);

            setCounts({
                pending: pendingRes.data?.length || 0,
                accepted: (receivedCount.data?.length || 0) + (preparingCount.data?.length || 0),
                ready: readyRes.data?.length || 0,
                tables: tablesRes.data?.length || 0,
                completed: completedRes.data?.length || 0,
            });
        } catch (err) {
            console.error("Error updating counts:", err);
        }
    };

    const fetchOrders = async () => {
        if (!restaurantId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel for better performance
            const [currentTabData, pendingRes, receivedCount, preparingCount, readyRes, completedRes] = await Promise.all([
                // Current tab data
                (async () => {
                    switch (activeTab) {
                        case "pending":
                            return await waiterService.getPendingOrders(restaurantId);
                        case "accepted":
                            const [receivedRes, preparingRes] = await Promise.all([
                                waiterService.getWaiterOrders("RECEIVED"),
                                waiterService.getWaiterOrders("PREPARING")
                            ]);
                            return {
                                data: [...(receivedRes.data || []), ...(preparingRes.data || [])]
                            };
                        case "ready":
                            return await waiterService.getWaiterOrders("READY");
                        case "completed":
                            return await waiterService.getWaiterOrders("COMPLETED");
                        default:
                            return { data: [] };
                    }
                })(),
                // Counts for all tabs
                waiterService.getPendingOrders(restaurantId),
                waiterService.getWaiterOrders("RECEIVED"),
                waiterService.getWaiterOrders("PREPARING"),
                waiterService.getWaiterOrders("READY"),
                waiterService.getWaiterOrders("COMPLETED")
            ]);

            // Set orders for current tab
            // For completed tab, filter out orders with AVAILABLE table status
            let ordersToDisplay = currentTabData.data || [];
            if (activeTab === "completed") {
                ordersToDisplay = ordersToDisplay.filter(order => 
                    order.table?.status !== "AVAILABLE"
                );
            }
            setOrders(ordersToDisplay);

            // Filter completed count to exclude AVAILABLE tables
            const activeCompletedOrders = (completedRes.data || []).filter(order => 
                order.table?.status !== "AVAILABLE"
            );

            setCounts({
                pending: pendingRes.data?.length || 0,
                accepted: (receivedCount.data?.length || 0) + (preparingCount.data?.length || 0),
                ready: readyRes.data?.length || 0,
                tables: tables.length,
                completed: activeCompletedOrders.length,
            });
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(t("waiter.error"));
        } finally {
            setLoading(false);
        }
    };

    // Use ref to store latest fetchOrders to avoid socket reconnections
    const fetchOrdersRef = useRef(fetchOrders);
    useEffect(() => {
        fetchOrdersRef.current = fetchOrders;
    }, [fetchOrders]);

    const fetchTables = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await waiterService.getWaiterTables();
            setTables(response.data || []);

            // Update all counts
            await updateCounts();
        } catch (err) {
            console.error("Error fetching tables:", err);
            setError(t("waiter.error"));
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (order) => {
        try {
            await waiterService.acceptOrder(order.id);
            // DO NOT automatically send to kitchen immediately if the requirement is to stay as RECEIVED first.
            // If the flow is "Accept" -> Order moves to Accepted tab -> Waiter reviews -> Waiter sends to kitchen manually.
            // OR if "Accept" implies "Send to Kitchen" but status should show "RECEIVED" until Kitchen starts "PREPARING".
            // However, the issue described is "Status is Received. Currently it becomes Preparing".
            // This suggests `sendToKitchen` is updating status to PREPARING.
            // For now, removing auto-send allows the order to sit in 'Accepted' state as 'RECEIVED'.
            fetchOrders();
        } catch (err) {
            console.error("Error accepting order:", err);
            toast.error(t("waiter.toasts.acceptFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
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
            toast.error(t("waiter.toasts.rejectFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    const handleServeOrder = async (order) => {
        try {
            await waiterService.markAsServed(order.id);
            fetchOrders();
        } catch (err) {
            console.error("Error marking order as served:", err);
            toast.error(t("waiter.toasts.serveFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    // ============================================
    // Bill Management Handlers
    // ============================================

    const handleCreateBill = async (order) => {
        try {
            const response = await waiterService.createBill(order.id);
            // Ensure bill data is properly parsed
            const billData = response.data?.bill || response.data;
            setBills(prev => ({ ...prev, [order.id]: billData }));
        } catch (err) {
            console.error("Error creating bill:", err);
            toast.error(t("waiter.toasts.billFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    const handleViewOrderDetails = async (orderId) => {
        try {
            // Fetch full order details
            const response = await waiterService.getOrderById(orderId);
            setSelectedOrderForView(response.data);
            setOrderDetailsModalOpen(true);
            setBillRequestNotification(null); // Clear toast when modal opens
        } catch (err) {
            console.error("Error fetching order details:", err);
            toast.error(t("waiter.toasts.orderDetailsFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    const handleCreateBillFromModal = async (order) => {
        try {
            const response = await waiterService.createBill(order.id);
            // Ensure bill data is properly parsed
            const billData = response.data?.bill || response.data;
            setBills(prev => ({ ...prev, [order.id]: billData }));

            // Show success notification
            toast.success(t("waiter.bill.created"), {
                description: t("waiter.bill.createdDesc"),
                duration: 4000
            });

            // Socket notification will be sent by backend automatically
            // Refresh data
            if (activeTab === "tables") {
                fetchTables();
            } else {
                fetchOrders();
            }
        } catch (err) {
            console.error("Error creating bill:", err);
            toast.error(t("waiter.toasts.billFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
            throw err;
        }
    };

    const handleApplyDiscount = (order) => {
        setSelectedOrderForBill(order);
        setDiscountModalOpen(true);
    };

    const handleConfirmDiscount = async (discountAmount) => {
        if (!selectedOrderForBill) return;

        try {
            await waiterService.applyDiscount(selectedOrderForBill.id, discountAmount);
            // Refresh bill
            const response = await waiterService.getBill(selectedOrderForBill.id);
            const billData = response.data?.bill || response.data;
            setBills(prev => ({ ...prev, [selectedOrderForBill.id]: billData }));
        } catch (err) {
            console.error("Error applying discount:", err);
            toast.error(t("waiter.toasts.discountFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    const handlePrintBill = async (order) => {
        try {
            await waiterService.printBill(order.id);
        } catch (err) {
            console.error("Error printing bill:", err);
            toast.error(t("waiter.toasts.printFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    const handleProcessPayment = (order) => {
        setSelectedOrderForBill(order);
        setPaymentModalOpen(true);
    };

    const handleConfirmPayment = async (paymentMethod) => {
        if (!selectedOrderForBill) return;

        const bill = bills[selectedOrderForBill.id];
        if (!bill) return;

        try {
            await waiterService.processPayment(selectedOrderForBill.id, {
                method: paymentMethod,
                amount: bill.subtotal,
                tax: bill.tax,
                total: bill.total
            });

            // Remove bill from state and refresh tables
            setBills(prev => {
                const newBills = { ...prev };
                delete newBills[selectedOrderForBill.id];
                return newBills;
            });

            fetchTables();
            toast.success(t("waiter.bill.paymentSuccess"), {
                description: t("waiter.bill.paymentDesc"),
                duration: 4000
            });
        } catch (err) {
            console.error("Error processing payment:", err);
            toast.error(t("waiter.toasts.paymentFailed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
        }
    };

    const handleMarkTableCompleted = async (order) => {
        try {
            // Reset table status to AVAILABLE
            await waiterService.markTableAsAvailable(order.table.id);
            
            toast.success(t("waiter.table.completed", "Table marked as completed"), {
                description: t("waiter.table.completedDesc", "Table is now available for new customers"),
                duration: 4000
            });
            
            // Refresh orders to remove from completed list
            fetchOrders();
            fetchTables();
        } catch (err) {
            console.error("Error marking table as completed:", err);
            toast.error(t("waiter.toasts.completeFailed", "Failed to mark table as completed"), {
                description: t("waiter.toasts.tryAgain"),
                duration: 3000
            });
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

            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground mt-4">{t("waiter.loading")}</p>
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
                                <p className="text-muted-foreground">{t("waiter.noOrders")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {orders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onAccept={handleAcceptOrder}
                                        onReject={handleRejectOrder}
                                        onServe={handleServeOrder}
                                        onMarkCompleted={handleMarkTableCompleted}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && activeTab === "tables" && (
                    <>
                        {tables.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{t("waiter.noTables")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {tables.map((tableData) => (
                                    <div
                                        key={tableData.table.id}
                                        className="bg-card rounded-lg border border-border shadow-warm p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold">
                                                    {tableData.table.tableNumber}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {tableData.table.location || "No location"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t("waiter.table.capacity", { count: tableData.table.capacity })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                {t("waiter.table.activeOrders", { count: tableData.orders.length })}
                                            </span>
                                        </div>
                                        {tableData.orders.map((order) => (
                                            <div key={order.id} className="space-y-3">
                                                <OrderCard
                                                    order={order}
                                                    showActions={false}
                                                />

                                                {/* Bill Management Section */}
                                                {(order.status === 'SERVED' || order.status === 'PAYMENT_PENDING') && (
                                                    <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                                                        {/* Bill Request Indicator */}
                                                        {order.status === 'PAYMENT_PENDING' && !bills[order.id] && (
                                                            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                                                                    <p className="text-sm font-semibold text-warning">
                                                                        {t("waiter.bill.requested")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!bills[order.id] ? (
                                                            <button
                                                                onClick={() => handleCreateBill(order)}
                                                                className="w-full px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-sm transition-smooth"
                                                            >
                                                                {t("waiter.bill.create")}
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <BillSummary bill={bills[order.id]} />
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button
                                                                        onClick={() => handleApplyDiscount(order)}
                                                                        className="px-3 py-2 border border-border text-foreground bg-card hover:bg-muted rounded-lg font-semibold text-sm transition-smooth"
                                                                    >
                                                                        {t("waiter.bill.applyDiscount")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handlePrintBill(order)}
                                                                        className="px-3 py-2 border border-border text-foreground bg-card hover:bg-muted rounded-lg font-semibold text-sm transition-smooth"
                                                                    >
                                                                        {t("waiter.bill.print")}
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleProcessPayment(order)}
                                                                    className="w-full px-4 py-3 bg-success text-success-foreground hover:bg-success/90 rounded-lg font-semibold text-sm transition-smooth"
                                                                >
                                                                    {t("waiter.bill.processPayment")}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Bills Management Section */}
                {/* REMOVED: Bills Management UI */}
            </div>

            <RejectModal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleConfirmReject}
                order={selectedOrder}
            />

            <DiscountModal
                isOpen={discountModalOpen}
                onClose={() => setDiscountModalOpen(false)}
                onConfirm={handleConfirmDiscount}
                order={selectedOrderForBill}
                currentBill={selectedOrderForBill ? bills[selectedOrderForBill.id] : null}
            />

            <PaymentModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
                bill={selectedOrderForBill ? bills[selectedOrderForBill.id] : null}
            />

            <OrderDetailsModal
                isOpen={orderDetailsModalOpen}
                onClose={() => {
                    setOrderDetailsModalOpen(false);
                    setSelectedOrderForView(null);
                }}
                order={selectedOrderForView}
                bill={selectedOrderForView ? bills[selectedOrderForView.id] : null}
                onCreateBill={handleCreateBillFromModal}
                onPrintBill={handlePrintBill}
                onApplyDiscount={handleApplyDiscount}
            />

            <BillRequestToast
                notification={billRequestNotification}
                onClose={() => setBillRequestNotification(null)}
                onViewOrder={() => {
                    if (billRequestNotification?.orderId) {
                        handleViewOrderDetails(billRequestNotification.orderId);
                    }
                }}
            />
        </div>
    );
};

export default WaiterDashboard;
