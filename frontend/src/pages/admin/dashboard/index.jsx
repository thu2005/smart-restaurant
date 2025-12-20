import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "./components/MetricCard";
import ActiveOrderCard from "./components/ActiveOrderCard";
import TableStatusGrid from "./components/TableStatusGrid";
import RecentActivityFeed from "./components/RecentActivityFeed";
import RevenueChart from "./components/RevenueChart";
import TopSellingItems from "./components/TopSellingItems";
import QuickActionPanel from "./components/QuickActionPanel";
import AlertNotifications from "./components/AlertNotifications";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const [refreshKey, setRefreshKey] = useState(0);

  const metrics = [
    {
      title: "Today's Revenue",
      value: "$2,847.50",
      change: "+12.5%",
      changeType: "positive",
      icon: "DollarSign",
      iconColor: "var(--color-success)",
      trend: [45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 85, 92],
    },
    {
      title: "Active Orders",
      value: "23",
      change: "+8",
      changeType: "positive",
      icon: "ShoppingBag",
      iconColor: "var(--color-accent)",
      trend: [30, 35, 40, 38, 45, 42, 48, 52, 55, 58, 60, 65],
    },
    {
      title: "Table Occupancy",
      value: "18/25",
      change: "72%",
      changeType: "neutral",
      icon: "Grid3x3",
      iconColor: "var(--color-primary)",
      trend: [60, 65, 70, 68, 72, 75, 78, 76, 80, 82, 85, 88],
    },
    {
      title: "Avg Order Value",
      value: "$42.80",
      change: "+5.2%",
      changeType: "positive",
      icon: "TrendingUp",
      iconColor: "var(--color-warning)",
      trend: [40, 42, 45, 43, 48, 50, 52, 55, 58, 60, 62, 65],
    },
  ];

  const activeOrders = [
    {
      id: 1,
      orderNumber: "1247",
      tableNumber: "12",
      status: "preparing",
      prepTime: 15,
      total: "87.50",
      items: [
        {
          name: "Grilled Salmon",
          quantity: 2,
          image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_1017a97cd-1765873722883.png",
          imageAlt:
            "Perfectly grilled salmon fillet with golden-brown sear served on white plate with lemon wedge and fresh herbs",
        },
        {
          name: "Caesar Salad",
          quantity: 1,
          image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
          imageAlt:
            "Fresh Caesar salad with crisp romaine lettuce, parmesan shavings, croutons and creamy dressing in white bowl",
        },
      ],
    },
    {
      id: 2,
      orderNumber: "1248",
      tableNumber: "8",
      status: "overdue",
      prepTime: 35,
      total: "124.00",
      items: [
        {
          name: "Ribeye Steak",
          quantity: 2,
          image: "https://images.unsplash.com/photo-1583953623787-ada99d338235",
          imageAlt:
            "Juicy ribeye steak with perfect grill marks, medium-rare center, served with roasted vegetables on dark plate",
        },
        {
          name: "Truffle Fries",
          quantity: 2,
          image: "https://images.unsplash.com/photo-1622368218165-02052d8b3557",
          imageAlt:
            "Golden crispy french fries topped with truffle oil, parmesan cheese and fresh parsley in metal basket",
        },
      ],
    },
    {
      id: 3,
      orderNumber: "1249",
      tableNumber: "5",
      status: "ready",
      prepTime: 22,
      total: "65.50",
      items: [
        {
          name: "Margherita Pizza",
          quantity: 1,
          image: "https://images.unsplash.com/photo-1703784022146-b72677752ce5",
          imageAlt:
            "Classic Margherita pizza with fresh mozzarella, basil leaves, tomato sauce on thin crispy crust",
        },
        {
          name: "Tiramisu",
          quantity: 2,
          image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_1626fae1c-1764819698380.png",
          imageAlt:
            "Traditional Italian tiramisu dessert with layers of coffee-soaked ladyfingers and mascarpone cream dusted with cocoa",
        },
      ],
    },
    {
      id: 4,
      orderNumber: "1250",
      tableNumber: "15",
      status: "pending",
      prepTime: 5,
      total: "52.00",
      items: [
        {
          name: "Chicken Alfredo",
          quantity: 1,
          image:
            "https://img.rocket.new/generatedImages/rocket_gen_img_10ae98cfe-1764828735525.png",
          imageAlt:
            "Creamy chicken alfredo pasta with grilled chicken breast, fettuccine noodles in rich parmesan sauce",
        },
      ],
    },
  ];

  const tables = [
    {
      id: 1,
      number: "1",
      status: "occupied",
      occupancyTime: 45,
      orderCount: 2,
    },
    {
      id: 2,
      number: "2",
      status: "available",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 3,
      number: "3",
      status: "occupied",
      occupancyTime: 28,
      orderCount: 1,
    },
    {
      id: 4,
      number: "4",
      status: "reserved",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 5,
      number: "5",
      status: "occupied",
      occupancyTime: 62,
      orderCount: 3,
    },
    {
      id: 6,
      number: "6",
      status: "cleaning",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 7,
      number: "7",
      status: "available",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 8,
      number: "8",
      status: "occupied",
      occupancyTime: 18,
      orderCount: 1,
    },
    {
      id: 9,
      number: "9",
      status: "available",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 10,
      number: "10",
      status: "occupied",
      occupancyTime: 35,
      orderCount: 2,
    },
    {
      id: 11,
      number: "11",
      status: "reserved",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 12,
      number: "12",
      status: "occupied",
      occupancyTime: 52,
      orderCount: 2,
    },
    {
      id: 13,
      number: "13",
      status: "available",
      occupancyTime: null,
      orderCount: 0,
    },
    {
      id: 14,
      number: "14",
      status: "occupied",
      occupancyTime: 25,
      orderCount: 1,
    },
    {
      id: 15,
      number: "15",
      status: "occupied",
      occupancyTime: 40,
      orderCount: 1,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "order_completed",
      title: "Order #1245 Completed",
      description: "Table 7 - 3 items delivered successfully",
      timestamp: new Date(Date.now() - 300000),
      amount: "78.50",
    },
    {
      id: 2,
      type: "payment_received",
      title: "Payment Received",
      description: "Table 12 - Stripe payment processed",
      timestamp: new Date(Date.now() - 600000),
      amount: "124.00",
    },
    {
      id: 3,
      type: "table_assigned",
      title: "Table Assigned",
      description: "Table 15 - Party of 4 seated",
      timestamp: new Date(Date.now() - 900000),
    },
    {
      id: 4,
      type: "menu_updated",
      title: "Menu Item Updated",
      description: "Grilled Salmon - Price changed to $28.50",
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: 5,
      type: "order_completed",
      title: "Order #1243 Completed",
      description: "Table 3 - 2 items delivered successfully",
      timestamp: new Date(Date.now() - 2400000),
      amount: "56.00",
    },
    {
      id: 6,
      type: "staff_login",
      title: "Staff Login",
      description: "Chef Michael Rodriguez logged in",
      timestamp: new Date(Date.now() - 3600000),
    },
  ];

  const revenueData = [
    { name: "8 AM", revenue: 145, orders: 8 },
    { name: "9 AM", revenue: 280, orders: 15 },
    { name: "10 AM", revenue: 320, orders: 18 },
    { name: "11 AM", revenue: 450, orders: 25 },
    { name: "12 PM", revenue: 680, orders: 38 },
    { name: "1 PM", revenue: 720, orders: 42 },
    { name: "2 PM", revenue: 580, orders: 32 },
    { name: "3 PM", revenue: 420, orders: 24 },
    { name: "4 PM", revenue: 380, orders: 21 },
    { name: "5 PM", revenue: 520, orders: 29 },
    { name: "6 PM", revenue: 780, orders: 45 },
    { name: "7 PM", revenue: 850, orders: 48 },
  ];

  const topSellingItems = [
    {
      id: 1,
      name: "Grilled Salmon",
      orderCount: 48,
      revenue: "1,368.00",
      rating: 4.8,
      growth: 15,
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1017a97cd-1765873722883.png",
      imageAlt:
        "Perfectly grilled salmon fillet with golden-brown sear served on white plate with lemon wedge and fresh herbs",
    },
    {
      id: 2,
      name: "Ribeye Steak",
      orderCount: 42,
      revenue: "1,890.00",
      rating: 4.9,
      growth: 22,
      image: "https://images.unsplash.com/photo-1583953623787-ada99d338235",
      imageAlt:
        "Juicy ribeye steak with perfect grill marks, medium-rare center, served with roasted vegetables on dark plate",
    },
    {
      id: 3,
      name: "Margherita Pizza",
      orderCount: 65,
      revenue: "1,235.00",
      rating: 4.7,
      growth: 18,
      image: "https://images.unsplash.com/photo-1703784022146-b72677752ce5",
      imageAlt:
        "Classic Margherita pizza with fresh mozzarella, basil leaves, tomato sauce on thin crispy crust",
    },
    {
      id: 4,
      name: "Caesar Salad",
      orderCount: 38,
      revenue: "532.00",
      rating: 4.6,
      growth: 12,
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
      imageAlt:
        "Fresh Caesar salad with crisp romaine lettuce, parmesan shavings, croutons and creamy dressing in white bowl",
    },
    {
      id: 5,
      name: "Truffle Fries",
      orderCount: 52,
      revenue: "624.00",
      rating: 4.8,
      growth: 25,
      image: "https://images.unsplash.com/photo-1622368218165-02052d8b3557",
      imageAlt:
        "Golden crispy french fries topped with truffle oil, parmesan cheese and fresh parsley in metal basket",
    },
  ];

  const alerts = [
    {
      id: 1,
      severity: "critical",
      title: "Order Overdue",
      message:
        "Order #1248 for Table 8 has exceeded 30 minutes preparation time. Immediate attention required.",
    },
    {
      id: 2,
      severity: "warning",
      title: "Low Stock Alert",
      message:
        "Salmon inventory is running low. Only 8 portions remaining for today's service.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (actionId) => {
    const routes = {
      menu: "/menu-browse",
      kitchen: "/kitchen/dashboard",
      tables: "/admin/dashboard",
      reports: "/admin/dashboard",
    };

    if (routes?.[actionId]) {
      navigate(routes?.[actionId]);
    }
  };

  const handleTableClick = (table) => {
    console.log("Table clicked:", table);
  };

  const handleOrderStatusUpdate = (orderId, newStatus) => {
    console.log("Order status update:", orderId, newStatus);
  };

  const handleAlertDismiss = (alertId) => {
    console.log("Alert dismissed:", alertId);
  };

  const handleAlertViewDetails = (alertId) => {
    console.log("View alert details:", alertId);
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Welcome back! Here's what's happening with your restaurant today.
        </p>
      </div>

      {alerts?.length > 0 && (
        <div className="mb-6 md:mb-8">
          <AlertNotifications
            alerts={alerts}
            onDismiss={handleAlertDismiss}
            onViewDetails={handleAlertViewDetails}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {metrics?.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="mb-6 md:mb-8">
        <QuickActionPanel onAction={handleQuickAction} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenueData}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div>
          <TopSellingItems items={topSellingItems} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                Active Orders
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  Live
                </span>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4 max-h-[600px] overflow-y-auto">
              {activeOrders?.map((order) => (
                <ActiveOrderCard
                  key={order?.id}
                  order={order}
                  onStatusUpdate={handleOrderStatusUpdate}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <RecentActivityFeed activities={recentActivities} />
        </div>
      </div>

      <div>
        <TableStatusGrid tables={tables} onTableClick={handleTableClick} />
      </div>
    </div>
  );
};

export default AdminDashboard;
