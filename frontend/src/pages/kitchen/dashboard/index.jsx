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
        name: item.menuItem?.name || "Unknown Item",
        quantity: item.quantity,
        modifiers: item.modifiers || [],
        specialInstructions: item.specialInstructions || "",
        allergens: item.menuItem?.dietary || []
      })) || [],
      orderNotes: order.specialInstructions || ""
    };
  };

  const mapOrderStatusToDisplay = (status) => {
    const statusMap = {
      'RECEIVED': 'new',
      'PREPARING': 'preparing',
      'READY': 'ready'
    };
    return statusMap[status] || status.toLowerCase();
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

  // Keep mock orders as fallback
  useEffect(() => {
    const mockOrders = [
      {
        id: "ORD-2025-001",
        orderNumber: "101",
        tableNumber: "5",
        timestamp: new Date(Date.now() - 180000),
        estimatedPrepTime: 15,
        status: "new",
        priority: "rush",
        items: [
          {
            name: "Grilled Salmon",
            quantity: 2,
            modifiers: ["Extra Lemon", "No Butter"],
            specialInstructions:
              "Well done, customer has fish allergy concerns",
            allergens: ["Fish"],
          },
          {
            name: "Caesar Salad",
            quantity: 1,
            modifiers: ["No Croutons", "Dressing on Side"],
            allergens: ["Dairy", "Eggs"],
          },
        ],
        orderNotes:
          "Customer celebrating anniversary - please ensure presentation is excellent",
      },
      {
        id: "ORD-2025-002",
        orderNumber: "102",
        tableNumber: "12",
        timestamp: new Date(Date.now() - 420000),
        estimatedPrepTime: 20,
        status: "preparing",
        priority: "normal",
        items: [
          {
            name: "Margherita Pizza",
            quantity: 1,
            modifiers: ["Extra Cheese", "Thin Crust"],
            allergens: ["Gluten", "Dairy"],
          },
          {
            name: "Chicken Wings",
            quantity: 3,
            modifiers: ["Spicy", "Ranch Dressing"],
          },
        ],
      },
      {
        id: "ORD-2025-003",
        orderNumber: "103",
        tableNumber: "8",
        timestamp: new Date(Date.now() - 600000),
        estimatedPrepTime: 12,
        status: "preparing",
        priority: "normal",
        items: [
          {
            name: "Beef Burger",
            quantity: 2,
            modifiers: ["Medium Rare", "Extra Pickles", "No Onions"],
            specialInstructions:
              "One burger without cheese for dietary restrictions",
          },
          {
            name: "French Fries",
            quantity: 2,
            modifiers: ["Large Size"],
          },
        ],
      },
      {
        id: "ORD-2025-004",
        orderNumber: "104",
        tableNumber: "3",
        timestamp: new Date(Date.now() - 900000),
        estimatedPrepTime: 18,
        status: "ready",
        priority: "normal",
        items: [
          {
            name: "Vegetable Stir Fry",
            quantity: 1,
            modifiers: ["Extra Spicy", "Brown Rice"],
            allergens: ["Soy"],
          },
          {
            name: "Spring Rolls",
            quantity: 4,
            modifiers: ["Vegetarian"],
          },
        ],
      },
      {
        id: "ORD-2025-005",
        orderNumber: "105",
        tableNumber: "15",
        timestamp: new Date(Date.now() - 240000),
        estimatedPrepTime: 25,
        status: "new",
        priority: "normal",
        items: [
          {
            name: "Ribeye Steak",
            quantity: 1,
            modifiers: ["Medium", "Garlic Butter"],
            specialInstructions: "Customer prefers thicker cut",
            allergens: ["Dairy"],
          },
          {
            name: "Mashed Potatoes",
            quantity: 1,
            modifiers: ["Extra Gravy"],
          },
          {
            name: "Grilled Vegetables",
            quantity: 1,
          },
        ],
      },
      {
        id: "ORD-2025-006",
        orderNumber: "106",
        tableNumber: "7",
        timestamp: new Date(Date.now() - 1200000),
        estimatedPrepTime: 10,
        status: "ready",
        priority: "rush",
        items: [
          {
            name: "Tomato Soup",
            quantity: 2,
            modifiers: ["Extra Croutons"],
          },
          {
            name: "Garlic Bread",
            quantity: 1,
            allergens: ["Gluten", "Dairy"],
          },
        ],
      },
    ];

    setOrders(mockOrders);
    calculateStats(mockOrders);
  }, []);

  const calculateStats = (orderList) => {
    // Stats are now fetched from API, but keep this for mock compatibility
    const newCount = orderList?.filter((o) => o?.status === "new")?.length;
    const preparingCount = orderList?.filter(
      (o) => o?.status === "preparing"
    )?.length;
    const readyCount = orderList?.filter((o) => o?.status === "ready")?.length;

    const totalPrepTime = orderList?.reduce((sum, order) => {
      const elapsed = Math.floor(
        (new Date() - new Date(order.timestamp)) / 60000
      );
      return sum + elapsed;
    }, 0);
    const avgTime =
      orderList?.length > 0 ? Math.round(totalPrepTime / orderList?.length) : 0;

    // Only update local stats if using mock data
    if (!restaurantId) {
      setStats({
        newOrders: newCount,
        preparing: preparingCount,
        ready: readyCount,
        avgPrepTime: avgTime,
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Map display status back to API status
      const statusMap = {
        'preparing': 'PREPARING',
        'ready': 'READY'
      };
      const apiStatus = statusMap[newStatus] || newStatus;

      await kitchenService.updateOrderStatus(orderId, apiStatus);

      // Optimistically update UI
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders?.map((order) =>
          order?.id === orderId ? { ...order, status: newStatus } : order
        );
        return updatedOrders;
      });

      // Refresh orders and stats from server
      fetchOrders(false);
      fetchStats();
      setNotificationTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      // Mark as COMPLETED when completing
      await kitchenService.updateOrderStatus(orderId, 'COMPLETED');

      // Remove from display
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders?.filter(
          (order) => order?.id !== orderId
        );
        return updatedOrders;
      });

      fetchStats();
    } catch (err) {
      console.error("Error completing order:", err);
      alert("Failed to complete order. Please try again.");
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
    setNotificationTrigger((prev) => prev + 1);
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

  const filteredOrders = getFilteredOrders();

  return (
    <>
      <Helmet>
        <title>Kitchen Display System - Smart Restaurant</title>
        <meta
          name="description"
          content="Real-time kitchen order management and preparation tracking system for restaurant staff"
        />
      </Helmet>
      <SoundNotification enabled={soundEnabled} trigger={notificationTrigger} />
      <div className="min-h-screen bg-background">
        <KitchenDisplayNav />

        <main className="pt-20 pb-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-[1920px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
                  Kitchen Display System
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Real-time order management and preparation tracking
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-md">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">
                  Live Updates
                </span>
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

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground mt-4">Loading orders...</p>
              </div>
            )}

            {error && (
              <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {!loading && !error && filteredOrders?.length === 0 ? (
              <EmptyState onRefresh={handleRefresh} />
            ) : (
              !loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {filteredOrders?.map((order) => (
                    <OrderCard
                      key={order?.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                      onComplete={handleCompleteOrder}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default KitchenDisplaySystem;
