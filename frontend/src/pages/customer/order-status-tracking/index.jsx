import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import OrderHeader from "./components/OrderHeader";
import OrderTimeline from "./components/OrderTimeline";
import OrderItemStatus from "./components/OrderItemStatus";
import KitchenNotes from "./components/KitchenNotes";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const OrderStatusTracking = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Mock order data with real-time status
  const [orderData] = useState({
    orderNumber: "ORD-1234",
    tableNumber: 12,
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    totalItems: 4,
    status: "preparing",
    estimatedReadyTime: new Date(Date.now() + 7 * 60 * 1000), // 7 minutes from now
    items: [
      {
        id: 1,
        name: "Grilled Salmon with Herbs",
        image:
          "https://img.rocket.new/generatedImages/rocket_gen_img_1017a97cd-1765873722883.png",
        imageAlt:
          "Perfectly grilled salmon fillet with fresh herbs and lemon on white ceramic plate",
        quantity: 2,
        status: "ready",
        estimatedTime: new Date(Date.now() - 2 * 60 * 1000),
        preparedBy: "Chef Maria",
        modifiers: ["Medium", "No garlic"],
        specialInstructions: "No garlic please",
      },
      {
        id: 2,
        name: "Caesar Salad",
        image: "https://images.unsplash.com/photo-1706781286074-236e1098912b",
        imageAlt:
          "Fresh Caesar salad with crispy romaine lettuce and parmesan cheese",
        quantity: 1,
        status: "preparing",
        estimatedTime: new Date(Date.now() + 3 * 60 * 1000),
        preparedBy: "Chef John",
        modifiers: ["Dressing on side"],
        specialInstructions: "",
      },
      {
        id: 3,
        name: "Margherita Pizza",
        image: "https://images.unsplash.com/photo-1615192606904-9cee34bf93c4",
        imageAlt:
          "Traditional Margherita pizza with fresh mozzarella and basil",
        quantity: 1,
        status: "preparing",
        estimatedTime: new Date(Date.now() + 7 * 60 * 1000),
        preparedBy: "Chef Marco",
        modifiers: ["Large", "Thin crust"],
        specialInstructions: "Extra basil",
      },
      {
        id: 4,
        name: "Chocolate Lava Cake",
        image: "https://images.unsplash.com/photo-1608108132333-2d5739d9426b",
        imageAlt:
          "Decadent chocolate lava cake with molten center and vanilla ice cream",
        quantity: 2,
        status: "received",
        estimatedTime: new Date(Date.now() + 12 * 60 * 1000),
        preparedBy: "Pastry Chef Anna",
        modifiers: ["With ice cream"],
        specialInstructions: "",
      },
    ],

    kitchenNotes: [
      {
        id: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        message: "Salmon dishes ready for pickup",
        type: "info",
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        message: "Working on salad and pizza",
        type: "info",
      },
    ],
  });

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate WebSocket updates (in real app, this would be actual WebSocket)
  useEffect(() => {
    const simulateUpdate = setInterval(() => {
      // In production, this would receive real-time updates from kitchen
      console.log("Checking for order updates...");
    }, 5000);

    return () => clearInterval(simulateUpdate);
  }, []);

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleBackToMenu = () => {
    navigate("/menu-browse");
  };

  const getOverallProgress = () => {
    const statusWeights = {
      received: 0,
      preparing: 50,
      ready: 100,
      served: 100,
    };
    const totalWeight = orderData?.items?.reduce((sum, item) => {
      return sum + (statusWeights?.[item?.status] || 0) * item?.quantity;
    }, 0);
    const maxWeight = orderData?.items?.reduce(
      (sum, item) => sum + 100 * item?.quantity,
      0
    );
    return Math.round((totalWeight / maxWeight) * 100);
  };

  const overallProgress = getOverallProgress();

  return (
    <>
      <Helmet>
        <title>
          Order Status - {orderData?.orderNumber} - Smart Restaurant
        </title>
        <meta
          name="description"
          content="Track your order preparation progress in real-time"
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
              Back to Menu
            </Button>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
              Order Status
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Track your order preparation in real-time
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
                items={orderData?.items}
                overallProgress={overallProgress}
                estimatedReadyTime={orderData?.estimatedReadyTime}
                currentTime={currentTime}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground">
                    Item Status ({orderData?.items?.length})
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
                        ? "Notifications On"
                        : "Notifications Off"}
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
                <KitchenNotes
                  notes={orderData?.kitchenNotes}
                  currentTime={currentTime}
                />

                <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                    Need Help?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have questions about your order, our staff is here to
                    assist you.
                  </p>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="MessageCircle"
                    iconPosition="left"
                  >
                    Contact Staff
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
                        Real-time Updates
                      </h4>
                      <p className="text-xs text-success/80">
                        This page automatically updates as your order progresses
                        through preparation.
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
