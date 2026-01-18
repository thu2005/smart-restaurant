import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../contexts/CurrencyContext";
import { io } from "socket.io-client";
import { toast } from "sonner";
import OrderHeader from "./components/OrderHeader";
import OrderTimeline from "./components/OrderTimeline";
import OrderItemStatus from "./components/OrderItemStatus";
import KitchenNotes from "./components/KitchenNotes";
import BillPaymentSection from "./components/BillPaymentSection";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import orderService from "../../../services/orderService";
import paymentService from "../../../services/paymentService";

const OrderStatusTracking = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await orderService.getActiveOrderByTable();
      if (response && response.data) {
        setOrderData(transformConstants(response.data));
        setError(null);
      } else {
        setOrderData(null);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);

      setOrderData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Socket.IO connection for real-time updates
  useEffect(() => {
    const restaurantId = localStorage.getItem('restaurantId');

    if (!restaurantId) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const newSocket = io(socketUrl.replace('/api', ''));

    newSocket.on("connect", () => {
      newSocket.emit("join_restaurant", restaurantId);
    });

    newSocket.on("order_status_update", ({ orderId, status }) => {
      fetchOrder();
    });

    newSocket.on("bill_created", ({ orderId, billData }) => {
      console.log("Bill created by waiter:", orderId);
      // Show success notification
      toast.success(t("customer.orderTracking.notifications.billReady", { total: formatCurrency(billData.total) }), {
        description: t("customer.orderTracking.notifications.proceedPayment"),
        duration: 5000
      });
      fetchOrder(); // Refresh to show bill details
    });

    newSocket.on("payment_confirmed", ({ orderId }) => {
      console.log("Payment confirmed:", orderId);
      // Show payment success
      toast.success(t("customer.orderTracking.notifications.paymentSuccess"), {
        description: t("customer.orderTracking.notifications.orderCompleted"),
        duration: 5000
      });
      fetchOrder();
    });

    newSocket.on("disconnect", () => { });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // Empty deps - socket setup once, fetchOrder is stable

  // Initial fetch + Fallback polling
  useEffect(() => {
    fetchOrder();

    // Fallback polling every 30 seconds (in case socket doesn't work)
    const pollInterval = setInterval(fetchOrder, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchOrder]);

  const transformConstants = (apiOrder) => {
    const mapOrderStatus = (status) => {
      const s = status?.toUpperCase();
      const statusMap = {
        'SUBMITTED': 'submitted',
        'RECEIVED': 'received',
        'PREPARING': 'preparing',
        'READY': 'ready',
        'SERVED': 'served',
        'PAYMENT_PENDING': 'payment_pending',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled',
        'REJECTED': 'rejected'
      };
      return statusMap[s] || 'submitted';
    };

    const mapItemStatus = (status) => {
      const s = status?.toLowerCase();
      if (s === 'served') return 'served';
      if (s === 'completed') return 'completed';
      if (s === 'ready') return 'ready';
      if (s === 'cooking') return 'cooking';
      if (s === 'rejected') return 'rejected';
      return 'queued';
    };

    const calculateEstimatedTime = (status, timestamp) => {
      // Simple heuristic: 15 mins for prep, etc.
      const baseTime = new Date(timestamp);
      if (status === 'PREPARING') return new Date(baseTime.getTime() + 20 * 60000);
      return new Date(baseTime.getTime() + 30 * 60000);
    };

    return {
      id: apiOrder.id,
      orderNumber: apiOrder.orderNumber,
      tableNumber: apiOrder.table?.tableNumber || "?",
      timestamp: new Date(apiOrder.createdAt || apiOrder.submittedAt),
      totalItems: apiOrder.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0,
      status: mapOrderStatus(apiOrder.status),
      estimatedReadyTime: calculateEstimatedTime(apiOrder.status, apiOrder.createdAt),
      items: (apiOrder.orderItems?.map(item => {
        const menuItem = item.menuItem;
        const primaryPhoto = menuItem?.photos?.find(p => p.isPrimary) || menuItem?.photos?.[0];

        return {
          id: item.id,
          name: menuItem?.name || "Unknown Item",
          image: menuItem?.image || primaryPhoto?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          imageAlt: menuItem?.description || menuItem?.name,
          quantity: item.quantity,
          status: mapItemStatus(item.itemStatus, apiOrder.status),
          estimatedTime: new Date(Date.now() + 15 * 60000),
          preparedBy: "Kitchen Staff",
          modifiers: parseModifiers(item.modifiers),
          specialInstructions: item.specialInstructions || "",
        };
      }) || []).sort((a, b) => {
        // Sort priority: active items (queued/cooking/ready) first, served/completed last
        const statusPriority = {
          'queued': 1,
          'cooking': 2,
          'ready': 3,
          'served': 4,
          'completed': 5
        };
        return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
      }),
      kitchenNotes: [] // API doesn't provide this yet
    };
  };

  const parseModifiers = (modifiers) => {
    if (!modifiers) return [];
    if (Array.isArray(modifiers)) {
      return modifiers.map(mod => {
        if (typeof mod === 'string') return mod;
        if (typeof mod === 'object' && mod.name) {
          return mod.quantity > 1 ? `${mod.quantity}x ${mod.name}` : mod.name;
        }
        return '';
      }).filter(Boolean);
    }
    return [];
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleBackToMenu = () => {
    navigate("/customer/menu-browse");
  };

  const handleRequestBill = async () => {
    if (!orderData) return;

    try {
      setLoading(true);
      await orderService.requestBill(orderData.id); // Use requestBill for customers
      toast.success(t("customer.orderTracking.notifications.billRequested"), {
        description: t("customer.orderTracking.notifications.billRequestDesc"),
        duration: 4000
      });
      fetchOrder(); // Refresh to show PAYMENT_PENDING status
    } catch (err) {
      console.error("Error requesting bill:", err);
      toast.error(t("customer.orderTracking.notifications.billRequestFail"), {
        description: t("customer.orderTracking.notifications.contactStaff"),
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePayment = async (method) => {
    console.log('Payment completed with method:', method);
    // Refresh order to show updated status
    await fetchOrder();

    // Show success message
    toast.success(t("customer.orderTracking.notifications.paymentSuccess"), {
      description: t("customer.orderTracking.notifications.orderCompleted"),
      duration: 4000
    });
  };
  const getOverallProgress = () => {
    if (!orderData) return 0;
    const statusWeights = {
      submitted: 10,
      received: 25,
      preparing: 50,
      ready: 80,
      served: 95,
      payment_pending: 100,
      completed: 100,
      cancelled: 0,
      rejected: 0
    };
    // If order has a global status, use that for simplicity, or average items
    return statusWeights[orderData.status] || 0;
  };

  const overallProgress = getOverallProgress();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center pt-20">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
            <Icon name="ShoppingBag" size={40} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("customer.orderTracking.noOrder.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("customer.orderTracking.noOrder.message")}</p>
          <Button onClick={handleBackToMenu}>{t("customer.orderTracking.noOrder.browseMenu")}</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {t("customer.orderTracking.title")} - {orderData?.orderNumber} - Smart Restaurant
        </title>
        <meta
          name="description"
          content={t("customer.orderTracking.subtitle")}
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-6 md:mb-8">
            <Button
              variant="ghost"
              iconName="ArrowLeft"
              iconPosition="left"
              onClick={handleBackToMenu}
              className="mb-4"
            >
              {t("customer.orderTracking.backToMenu")}
            </Button>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
              {t("customer.orderTracking.title")}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {t("customer.orderTracking.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <OrderHeader
                orderNumber={orderData?.orderNumber}
                tableNumber={orderData?.tableNumber}
                timestamp={orderData?.timestamp}
                totalItems={orderData?.totalItems}
                status={orderData?.status}
                currentTime={currentTime}
              />

              <OrderTimeline
                orderStatus={orderData?.status}
                items={orderData?.items}
                overallProgress={overallProgress}
                estimatedReadyTime={orderData?.estimatedReadyTime}
                currentTime={currentTime}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">
                    {t("customer.orderTracking.itemStatusTitle")} ({orderData?.items?.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <Icon
                      name={notificationsEnabled ? "Bell" : "BellOff"}
                      size={20}
                      color="var(--color-muted-foreground)"
                    />

                    <button
                      onClick={handleNotificationToggle}
                      className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {notificationsEnabled
                        ? t("customer.orderTracking.notifications.on")
                        : t("customer.orderTracking.notifications.off")}
                    </button>
                  </div>
                </div>
                {orderData?.items?.map((item) => (
                  <OrderItemStatus
                    key={item?.id}
                    item={item}
                    currentTime={currentTime}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Request Bill Button */}
                {orderData?.status === 'served' && (
                  <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                      {t("customer.orderTracking.actions.readyToPay")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("customer.orderTracking.actions.requestBillDesc")}
                    </p>
                    <Button
                      variant="primary"
                      fullWidth
                      iconName="FileText"
                      iconPosition="left"
                      onClick={handleRequestBill}
                    >
                      {t("customer.orderTracking.actions.requestBill")}
                    </Button>
                  </div>
                )}

                {/* Bill & Payment Section */}
                {orderData?.bill && orderData?.status === 'payment_pending' && (
                  <BillPaymentSection
                    order={orderData}
                    onPay={handlePayment}
                  />
                )}

                {orderData?.kitchenNotes.length > 0 && (
                  <KitchenNotes
                    notes={orderData?.kitchenNotes}
                    currentTime={currentTime}
                  />
                )}

                <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                    {t("customer.orderTracking.actions.needHelp")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("customer.orderTracking.actions.helpDesc")}
                  </p>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="MessageCircle"
                    iconPosition="left"
                  >
                    {t("customer.orderTracking.actions.contactStaff")}
                  </Button>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Icon
                      name="Info"
                      size={20}
                      color="var(--color-success)"
                      className="flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-success mb-1">
                        {t("customer.orderTracking.info.realTimeUpdates")}
                      </h4>
                      <p className="text-xs text-success/80">
                        {t("customer.orderTracking.info.updatesDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OrderStatusTracking;
