import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { io } from "socket.io-client";
import KitchenDisplayNav from "../../../components/navigation/KitchenDisplayNav";
import OrderCard from "./components/OrderCard";
import OrderFilters from "./components/OrderFilters";
import OrderStats from "./components/OrderStats";
import EmptyState from "./components/EmptyState";
import SoundNotification from "./components/SoundNotification";
import kitchenService from "../../../services/kitchenService";
import authService from "../../../services/authService";

const KitchenDisplaySystem = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time-asc");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationTrigger, setNotificationTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [stats, setStats] = useState({
    newOrders: 0,
    preparing: 0,
    ready: 0,
    avgPrepTime: 0,
  });

  const user = authService.getCurrentUser();
  const restaurantId = user?.restaurantId;

  // Initialize WebSocket connection
  useEffect(() => {
    if (!restaurantId) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      console.log("Kitchen WebSocket connected");
      newSocket.emit("join_restaurant", restaurantId);
    });

    newSocket.on("new_order", (order) => {
      console.log("New order received in kitchen:", order);
      if (order.status === "RECEIVED") {
        fetchOrders(false);
        setNotificationTrigger((prev) => prev + 1);
      }
    });

    newSocket.on("order_status_update", ({ orderId, status }) => {
      console.log("Order status updated:", orderId, status);
      fetchOrders(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [restaurantId]);

  // Fetch orders and stats
  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      fetchStats();
    }
  }, [restaurantId, statusFilter]);

  const fetchOrders = async (isLoading = true) => {
    if (!restaurantId) return;

    if (isLoading) setLoading(true);
    setError(null);

    try {
      const response = await kitchenService.getKitchenOrders(restaurantId, statusFilter);
      // Backend returns { success: true, data: [...] }
      const apiOrders = response.data?.data || [];

      // Transform API orders to match the kitchen display format
      const transformedOrders = apiOrders.map(order => transformOrderForDisplay(order));

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
      if (isLoading) setError("Failed to load orders. Please try again.");
    } finally {
      if (isLoading) setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!restaurantId) return;

    try {
      const response = await kitchenService.getKitchenStats(restaurantId);
      // Backend returns { success: true, data: {...} }
      setStats(response.data?.data || {
        newOrders: 0,
        preparing: 0,
        ready: 0,
        avgPrepTime: 0,
      });
    } catch (err) {
      console.error("Error fetching kitchen stats:", err);
    }
  };

  // Transform database order to kitchen display format
  const transformOrderForDisplay = (order) => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table?.tableNumber || "?",
      timestamp: order.submittedAt || order.createdAt,
      estimatedPrepTime: calculateEstimatedPrepTime(order),
      status: mapOrderStatusToDisplay(order.status),
      priority: determinePriority(order),
      items: order.orderItems?.map(item => ({
        id: item.id,
        name: item.menuItem?.name || "Unknown Item",
        quantity: item.quantity,
        modifiers: item.modifiers || [],
        specialInstructions: item.specialInstructions || "",
        allergens: [], // TODO: Add allergens field to MenuItem schema (different from dietary)
        itemStatus: item.itemStatus || 'queued' // Add itemStatus
      })) || [],
      orderNotes: order.specialInstructions || ""
    };
  };

  const mapOrderStatusToDisplay = (status) => {
    // Map backend status to 3 main columns
    const statusMap = {
      'SUBMITTED': 'received',
      'PENDING': 'received',
      'RECEIVED': 'received',
      'ACCEPTED': 'received',
      'PREPARING': 'preparing',
      'COOKING': 'preparing',
      'READY': 'ready'
    };
    return statusMap[status] || 'received';
  };

  const determinePriority = (order) => {
    // Determine if order is rush (older than 15 minutes or has special instructions)
    const orderAge = Date.now() - new Date(order.submittedAt || order.createdAt).getTime();
    const isOld = orderAge > 15 * 60 * 1000; // 15 minutes
    const hasSpecialInstructions = order.specialInstructions ||
      order.orderItems?.some(item => item.specialInstructions);
    return (isOld || hasSpecialInstructions) ? "rush" : "normal";
  };

  const calculateEstimatedPrepTime = (order) => {
    // Simple estimation based on number of items
    const itemCount = order.orderItems?.length || 0;
    return Math.max(10, itemCount * 5);
  };



  const handleStatusChange = async (orderId, newStatus) => {
    // Legacy support for manual status change if needed, 
    // but now mostly driven by item updates or "Mark All Ready"
    try {
      const statusMap = { 'preparing': 'PREPARING', 'ready': 'READY' };
      const apiStatus = statusMap[newStatus] || newStatus;
      await kitchenService.updateOrderStatus(orderId, apiStatus);
      fetchOrders(false);
      fetchStats();
      if(newStatus === 'preparing') setNotificationTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    // This function might be deprecated if Kitchen doesn't complete orders,
    // but we keep it for now if the card calls it.
    try {
      // Mark as COMPLETED when completing
        await kitchenService.updateOrderStatus(orderId, 'COMPLETED');
        fetchStats();
        fetchOrders(false);
    } catch(err) {
        console.error(err);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
    setNotificationTrigger(prev => prev + 1);
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered?.filter((order) => order?.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered?.filter(
        (order) => order?.priority === priorityFilter
      );
    }

    switch (sortBy) {
      case "time-asc":
        filtered?.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case "time-desc":
        filtered?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case "table-asc":
        filtered?.sort(
          (a, b) => parseInt(a?.tableNumber) - parseInt(b?.tableNumber)
        );
        break;
      case "priority":
        filtered?.sort((a, b) => {
          if (a?.priority === "rush" && b?.priority !== "rush") return -1;
          if (a?.priority !== "rush" && b?.priority === "rush") return 1;
             return new Date(a.timestamp) - new Date(b.timestamp);
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const getGroupedOrders = () => {
      const filtered = getFilteredOrders();
      const columns = { received: [], preparing: [], ready: [] };
      filtered.forEach(order => {
          const status = order.status === 'new' ? 'received' : order.status;
          if (columns[status]) {
              columns[status].push(order);
          } else {
              columns.received.push(order);
          }
      });
      return columns;
  };

  const groupedOrders = getGroupedOrders();

  return (
    <>
      <Helmet>
        <title>Kitchen Display System - Smart Restaurant</title>
      </Helmet>
      <SoundNotification enabled={soundEnabled} trigger={notificationTrigger} />
      <div className="min-h-screen bg-background flex flex-col">
        <KitchenDisplayNav />

        <main className="flex-1 pt-20 pb-4 px-4 md:px-6 overflow-x-auto">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Kitchen Display
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time Order Board
                </p>
              </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full border border-success/20">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-bold text-success uppercase">Live</span>
                  </div>
                  <button onClick={handleRefresh} className="p-2 hover:bg-muted rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                  </button>
               </div>
            </div>

            <OrderStats stats={stats} />

            <OrderFilters
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onRefresh={handleRefresh}
            />

            {loading && !orders.length ? (
               <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
               </div>
            ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 mt-6">
                    {/* Received Column */}
                    <div className="flex flex-col h-full bg-muted/30 rounded-xl border border-border/60 overflow-hidden">
                        <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-accent"></span>
                                Received
                                <span className="bg-background text-foreground text-xs px-2 py-0.5 rounded-full border border-border shadow-sm">
                                    {groupedOrders.received.length}
                                </span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                           {groupedOrders.received.map(order => (
                               <OrderCard 
                                key={order.id} 
                                order={order} 
                                onStatusChange={handleStatusChange}
                                onComplete={handleCompleteOrder} // Pass pass legacy handler
                                onRefresh={handleRefresh} // Pass refresh so item updates trigger reload
                               />
                           ))}
                           {groupedOrders.received.length === 0 && (
                               <div className="text-center py-10 text-muted-foreground opacity-50 italic">No new orders</div>
                           )}
                        </div>
                    </div>

                    {/* Preparing Column */}
                    <div className="flex flex-col h-full bg-muted/30 rounded-xl border border-border/60 overflow-hidden">
                        <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-warning animate-pulse"></span>
                                Preparing
                                <span className="bg-background text-foreground text-xs px-2 py-0.5 rounded-full border border-border shadow-sm">
                                    {groupedOrders.preparing.length}
                                </span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                           {groupedOrders.preparing.map(order => (
                               <OrderCard 
                                key={order.id} 
                                order={order} 
                                onStatusChange={handleStatusChange}
                                onComplete={handleCompleteOrder}
                                onRefresh={handleRefresh}
                               />
                           ))}
                           {groupedOrders.preparing.length === 0 && (
                               <div className="text-center py-10 text-muted-foreground opacity-50 italic">Kitchen is clear</div>
                           )}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="flex flex-col h-full bg-muted/30 rounded-xl border border-border/60 overflow-hidden">
                        <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-success"></span>
                                Ready
                                <span className="bg-background text-foreground text-xs px-2 py-0.5 rounded-full border border-border shadow-sm">
                                    {groupedOrders.ready.length}
                                </span>
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                           {groupedOrders.ready.map(order => (
                               <OrderCard 
                                key={order.id} 
                                order={order} 
                                onStatusChange={handleStatusChange}
                                onComplete={handleCompleteOrder}
                                onRefresh={handleRefresh}
                               />
                           ))}
                           {groupedOrders.ready.length === 0 && (
                               <div className="text-center py-10 text-muted-foreground opacity-50 italic">No orders ready</div>
                           )}
                        </div>
                    </div>
                </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default KitchenDisplaySystem;
