import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../contexts/CurrencyContext";
import { io } from "socket.io-client";
import MetricCard from "./components/MetricCard";
import ActiveOrderCard from "./components/ActiveOrderCard";
import TableStatusGrid from "./components/TableStatusGrid";
import RecentActivityFeed from "./components/RecentActivityFeed";
import RevenueChart from "./components/RevenueChart";
import TopSellingItems from "./components/TopSellingItems";
import QuickActionPanel from "./components/QuickActionPanel";
import AlertNotifications from "./components/AlertNotifications";
import dashboardApi from "../../../services/dashboardApi";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("today");
  const [refreshKey, setRefreshKey] = useState(0);
  const [socket, setSocket] = useState(null);

  // Data states
  const [metrics, setMetrics] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get restaurantId from localStorage or user context
  const getRestaurantId = () => {
    return localStorage.getItem("restaurantId") || "default-restaurant-id";
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = getRestaurantId();
      const data = await dashboardApi.getDashboardData(restaurantId);

      // Helper for percentage change
      const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      // Calculate Revenue Change
      const todayRev = data.revenue.totalRevenue || 0;
      const yesterRev = data.yesterdayRevenue?.totalRevenue || 0;
      const revChangeVal = calculatePercentageChange(todayRev, yesterRev);
      const revChange = `${revChangeVal > 0 ? '+' : ''}${revChangeVal.toFixed(1)}%`;
      const revChangeType = revChangeVal >= 0 ? "positive" : "negative";

      // Calculate AOV Change
      const todayAOV = data.revenue.averageOrderValue || 0;
      const yesterAOV = data.yesterdayRevenue?.averageOrderValue || 0;
      const aovChangeVal = calculatePercentageChange(todayAOV, yesterAOV);
      const aovChange = `${aovChangeVal > 0 ? '+' : ''}${aovChangeVal.toFixed(1)}%`;
      const aovChangeType = aovChangeVal >= 0 ? "positive" : "negative";

      // Update metrics
      const newMetrics = [
        {
          title: t('admin.dashboard.metrics.todayRevenue'),
          value: formatCurrency(data.revenue.totalRevenue || 0),
          change: revChange,
          changeType: revChangeType,
          icon: "DollarSign",
          iconColor: "var(--color-success)",
          trend: [45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 85, 92],
        },
        {
          title: t('admin.dashboard.metrics.currentOrders'),
          value: data.activeOrders?.length?.toString() || "0",
          change: `+${data.activeOrders?.length || 0}`,
          changeType: "positive",
          icon: "ShoppingBag",
          iconColor: "var(--color-accent)",
          trend: [30, 35, 40, 38, 45, 42, 48, 52, 55, 58, 60, 65],
        },
        {
          title: t('admin.dashboard.metrics.tableOccupancy'),
          value: `${data.tableOccupancy?.occupiedTables || 0}/${data.tableOccupancy?.totalTables || 0}`,
          change: `${Math.round((data.tableOccupancy?.occupancyRate || 0) * 100)}%`,
          changeType: "neutral",
          icon: "Grid3x3",
          iconColor: "var(--color-primary)",
          trend: [60, 65, 70, 68, 72, 75, 78, 76, 80, 82, 85, 88],
        },
        {
          title: t('admin.dashboard.metrics.avgOrderValue'),
          value: formatCurrency(data.revenue.averageOrderValue || 0),
          change: aovChange,
          changeType: aovChangeType,
          icon: "TrendingUp",
          iconColor: "var(--color-warning)",
          trend: [40, 42, 45, 43, 48, 50, 52, 55, 58, 60, 62, 65],
        },
      ];

      setMetrics(newMetrics);
      setActiveOrders(data.activeOrders || []);
      setTables(data.tableOccupancy?.tables || []);
      setRecentActivities(data.recentActivity || []);
      setRecentActivities(data.recentActivity || []);

      // Filter out dismissed alerts
      const dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
      const activeAlerts = (data.alerts || []).filter(alert => !dismissedAlerts.includes(alert.id));
      setAlerts(activeAlerts);

      // Revenue data and Top Selling Items are handled by fetchPeriodData useEffect now

      // Debug log for active orders
      console.log("Active Orders Data:", data.activeOrders);

      setLoading(false);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || t('common.messages.error'));
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const restaurantId = getRestaurantId();
    if (!restaurantId) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      console.log("Admin Dashboard WebSocket connected");
      newSocket.emit("join_restaurant", restaurantId);
    });

    // Listen for order status updates
    newSocket.on("order_status_update", ({ orderId, status }) => {
      console.log("Order status updated:", orderId, status);
      // Refresh dashboard data to update recent activity and metrics
      fetchDashboardData();
    });

    // Listen for new orders
    newSocket.on("new_order", (order) => {
      console.log("New order received:", order);
      fetchDashboardData();
    });

    // Listen for payment events
    newSocket.on("payment_processed", (payment) => {
      console.log("Payment processed:", payment);
      fetchDashboardData();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch chart data and top selling items when dateRange changes
  useEffect(() => {
    const fetchPeriodData = async () => {
      try {
        const restaurantId = getRestaurantId();

        // Fetch chart data and top items in parallel
        const [chartDataResponse, topItemsResponse] = await Promise.all([
          dashboardApi.getRevenueChartData(restaurantId, dateRange),
          dashboardApi.getTopSellingItems(restaurantId, dateRange)
        ]);

        // Process Chart Data
        if (chartDataResponse.chartData) {
          const transformedData = chartDataResponse.chartData.map((item) => ({
            name: item.period || item.date,
            revenue: parseFloat(item.revenue) || 0,
            orders: item.orderCount || 0,
          }));
          setRevenueData(transformedData);
        } else {
          // Handle case where chartData might be missing or different format
          setRevenueData([]);
        }

        // Process Top Items
        setTopSellingItems(topItemsResponse || []);

      } catch (err) {
        console.error("Error fetching period data:", err);
      }
    };

    if (getRestaurantId()) {
      fetchPeriodData();
    }
  }, [dateRange, refreshKey]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (actionId) => {
    const routes = {
      menu: "/admin/menu/items",
      kitchen: "/admin/kitchen/dashboard",
      tables: "/admin/tables",
      reports: "/admin/reports",
    };

    if (routes?.[actionId]) {
      navigate(routes?.[actionId]);
    }
  };

  const handleTableClick = (table) => {
    console.log("Table clicked:", table);
    // TODO: Navigate to table details or show modal
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    console.log("Order status update:", orderId, newStatus);
    // TODO: Call API to update order status
    // Then refresh dashboard data
    await fetchDashboardData();
  };

  const handleAlertDismiss = (alertId) => {
    // Save dismissed alert to localStorage
    const dismissedAlerts = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
    if (!dismissedAlerts.includes(alertId)) {
      localStorage.setItem('dismissedAlerts', JSON.stringify([...dismissedAlerts, alertId]));
    }
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const handleAlertViewDetails = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    if (alert.orderId || alert.title?.toLowerCase().includes('order')) {
      // Navigate to kitchen dashboard for order issues
      navigate('/admin/kitchen/dashboard');
    } else if (alert.itemId || alert.title?.toLowerCase().includes('stock')) {
      // Navigate to menu items for stock issues
      navigate('/admin/menu/items');
    } else {
      // Default fallback
      console.log("View alert details:", alert);
    }
  };

  // Loading state
  if (loading && metrics.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && metrics.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">{t('common.messages.error')}</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {t('common.actions.refresh')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('admin.dashboard.welcome')}!
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
                {t('admin.dashboard.sections.activeOrders')}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  Live
                </span>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
              {activeOrders?.length > 0 ? (
                activeOrders.map((order) => (
                  <ActiveOrderCard
                    key={order?.id}
                    order={order}
                    onStatusUpdate={handleOrderStatusUpdate}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active orders at the moment
                </p>
              )}
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
