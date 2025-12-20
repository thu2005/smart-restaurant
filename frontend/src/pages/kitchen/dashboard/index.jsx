import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import KitchenDisplayNav from "../../../components/navigation/KitchenDisplayNav";
import OrderCard from "./components/OrderCard";
import OrderFilters from "./components/OrderFilters";
import OrderStats from "./components/OrderStats";
import EmptyState from "./components/EmptyState";
import SoundNotification from "./components/SoundNotification";

const KitchenDisplaySystem = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time-asc");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationTrigger, setNotificationTrigger] = useState(0);
  const [stats, setStats] = useState({
    newOrders: 0,
    preparing: 0,
    ready: 0,
    avgPrepTime: 0,
  });

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

    setStats({
      newOrders: newCount,
      preparing: preparingCount,
      ready: readyCount,
      avgPrepTime: avgTime,
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders?.map((order) =>
        order?.id === orderId ? { ...order, status: newStatus } : order
      );
      calculateStats(updatedOrders);
      setNotificationTrigger((prev) => prev + 1);
      return updatedOrders;
    });
  };

  const handleCompleteOrder = (orderId) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders?.filter(
        (order) => order?.id !== orderId
      );
      calculateStats(updatedOrders);
      return updatedOrders;
    });
  };

  const handleRefresh = () => {
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

            {filteredOrders?.length === 0 ? (
              <EmptyState onRefresh={handleRefresh} />
            ) : (
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
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default KitchenDisplaySystem;
