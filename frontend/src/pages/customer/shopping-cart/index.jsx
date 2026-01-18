import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { useCart } from "../../../contexts/CartContext";
import orderService from "../../../services/orderService";
import authService from "../../../services/authService";
import paymentService from "../../../services/paymentService";
import { tableAPI } from "../../../services/tableService";
import CartItemCard from "./components/CartItemCard";
import OrderSummary from "./components/OrderSummary";
import SpecialInstructionsSection from "./components/SpecialInstructionsSection";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import BillPaymentSection from "../order-status-tracking/components/BillPaymentSection";
import TableVerification from "./components/TableVerification";
import EmptyCartState from "./components/EmptyCartState";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartSummary, getEstimatedWaitTime } = useCart();
  const user = authService.getCurrentUser();

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [tableNumber] = useState(localStorage.getItem("tableNumber") || "N/A");
  const [tableDetails, setTableDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success', // success, error, confirm
    title: '',
    message: '',
    onConfirm: null
  });

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const showModal = (type, title, message, onConfirm = null) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    });
  };

  // Fetch active order with bill
  const fetchActiveOrder = async () => {
    try {
      const tableId = localStorage.getItem("tableId");
      const restaurantId = localStorage.getItem("restaurantId");
      console.log('Fetching active order for table:', tableId, 'restaurant:', restaurantId);
      if (tableId && restaurantId) {
        const response = await orderService.getActiveOrderByTable(tableId, restaurantId);
        console.log('Active order response:', response);
        console.log('Response data keys:', Object.keys(response?.data || {}));
        console.log('Full response.data:', JSON.stringify(response?.data, null, 2));
        if (response?.data) {
          if (response.data.bill) {
            console.log('Active order has bill! Setting activeOrder state');
            console.log('Bill data:', response.data.bill);
            setActiveOrder(response.data);
            console.log('activeOrder state should now have bill. Checking after set...');
          } else {
            console.log('No bill found in active order');
            console.log('Order status:', response.data.status);
            console.log('Checking if bill exists elsewhere in response...');
            setActiveOrder(null);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch active order:", error);
    }
  };

  useEffect(() => {
    const fetchTableInfo = async () => {
      const tableId = localStorage.getItem("tableId");
      if (tableId) {
        try {
          const data = await tableAPI.getTableById(tableId);
          setTableDetails(data);
        } catch (error) {
          console.error("Failed to fetch table details:", error);
        }
      }
    };
    fetchTableInfo();
    fetchActiveOrder(); // Fetch active order on mount
  }, []);

  // Debug: Log when activeOrder state changes
  useEffect(() => {
    console.log('🔄 activeOrder state changed:', activeOrder);
    console.log('🔍 Has bill?', !!activeOrder?.bill);
    if (activeOrder?.bill) {
      console.log('✅ Bill exists in state, BillPaymentSection should render');
    } else {
      console.log('❌ No bill in state, showing cart/order flow');
    }
  }, [activeOrder]);

  // Setup socket listener for bill creation
  useEffect(() => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socket = io(socketUrl.replace('/api', ''));

    socket.on("connect", () => {
      socket.emit("join_restaurant", restaurantId);
    });

    socket.on("bill_created", ({ orderId, billData }) => {
      console.log("SOCKET EVENT: bill_created received!");
      console.log("Order ID:", orderId);
      console.log("Bill Data:", billData);
      toast.success(`Your bill is ready! Total: ${billData.total.toLocaleString('vi-VN')}₫`, {
        description: "You can now proceed with payment.",
        duration: 5000
      });
      console.log("Fetching active order to show bill...");
      fetchActiveOrder(); // Refresh to show bill
    });

    socket.on("payment_confirmed", () => {
      toast.success("Payment received! Thank you!", {
        duration: 5000
      });
      setActiveOrder(null); // Clear bill after payment
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateQuantity = (cartId, newQuantity) => {
    updateQuantity(cartId, newQuantity);
  };

  const handleRemoveItem = (cartId) => {
    removeFromCart(cartId);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePayment = async (paymentMethod) => {
    if (!activeOrder || !activeOrder.bill) return;

    try {
      setIsProcessing(true);
      
      const restaurantId = localStorage.getItem("restaurantId");
      const bill = activeOrder.bill;
      
      // Calculate orderItems subtotal
      const orderItems = activeOrder.orderItems || activeOrder.items || [];
      const subtotal = orderItems.reduce((sum, item) => {
        const itemPrice = parseFloat(item.unitPrice || item.price || item.menuItem?.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + (itemPrice * quantity);
      }, 0);
      
      const discount = parseFloat(bill.discount || 0);
      const tax = (subtotal - discount) * 0.1;
      const total = subtotal - discount + tax;
      
      const response = await paymentService.createPayment({
        orderId: activeOrder.id,
        restaurantId: restaurantId,
        amount: total,
        method: paymentMethod.toUpperCase(),
        tip: 0,
        tax: tax
      });
      
      console.log('Payment response:', response.data);
      
      // If MoMo payment, redirect to payment URL
      if (paymentMethod.toLowerCase() === 'momo' && response.data?.data?.gatewayResponse?.payUrl) {
        const payUrl = response.data.data.gatewayResponse.payUrl;
        console.log('Redirecting to MoMo payment:', payUrl);
        toast.info("Redirecting to MoMo payment...", { duration: 2000 });
        
        // Redirect to MoMo payment page
        setTimeout(() => {
          window.location.href = payUrl;
        }, 1000);
        return;
      }
      
      // For other payment methods (CASH, CARD)
      toast.success("Payment processed successfully!", {
        description: "Thank you for your visit!",
        duration: 5000
      });
      
      setActiveOrder(null); // Clear bill after payment
      clearCart(); // Clear cart
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error("Payment failed", {
        description: err.response?.data?.message || "Please try again or contact staff.",
        duration: 4000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPlaceOrder = async (extraOrderData = {}) => {
    try {
      const orderData = {
        restaurantId: localStorage.getItem("restaurantId"),
        tableId: localStorage.getItem("tableId"),
        customerName: user?.fullName || localStorage.getItem("customerName") || "Guest",
        customerPhone: user?.phone || localStorage.getItem("customerPhone") || "",
        specialInstructions: specialInstructions,
        ...extraOrderData
      };

      // Use smart placeOrder method that handles create/add logic
      const result = await orderService.placeOrder(cartItems, orderData);

      if (result.success) {
        // Clear cart after successful order
        clearCart();

        showModal('success', 'Order Placed!', `Your order #${result.data?.orderNumber} has been placed successfully.`, () => {
          navigate("/customer/order-status-tracking");
        });

      } else {
        throw new Error(result.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showModal('error', 'Order Failed', error.response?.data?.message || error.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      showModal('error', 'Payment Required', 'Please select a payment method before proceeding.');
      return;
    }

    if (cartItems.length === 0) {
      showModal('error', 'Empty Cart', 'Your cart is empty. Please add items from the menu.');
      return;
    }

    // Validate Context (Table/Restaurant)
    const restaurantId = localStorage.getItem("restaurantId");
    const tableId = localStorage.getItem("tableId");

    if (!restaurantId || !tableId) {
      showModal('error', 'Missing Information', 'Missing table information. Please scan the QR code again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Check for active order first to show confirmation if needed
      const activeOrder = await orderService.getActiveOrderByTable(tableId, restaurantId);

      if (activeOrder.data) {
        const status = activeOrder.data.status;
        // Allow adding items to order in these statuses (single order per table session)
        const ALLOWED_STATUSES_TO_ADD = ['SERVED', 'PAYMENT_PENDING'];

        if (!ALLOWED_STATUSES_TO_ADD.includes(status)) {
          showModal('error', 'Order In Progress', `You have an order in progress (${status}). Please wait for all items to be served before placing a new order.`);
          setIsProcessing(false);
          return;
        }

        // Show Confirmation Modal
        showModal(
          'confirm',
          'Add to Current Order',
          'Would you like to add these items to your current order?',
          () => confirmPlaceOrder()
        );
        return;
      }

      // No active order, proceed directly
      await confirmPlaceOrder();

    } catch (error) {
      console.error("Checkout check error:", error);
      showModal('error', 'Error', "Failed to check order status. Please try again.");
      setIsProcessing(false);
    }
  };

  const { itemCount, subtotal, tax, total } = getCartSummary();

  // Show empty cart only if there's no cart items AND no active order with bill
  if (cartItems.length === 0 && !activeOrder?.bill) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Smart Restaurant</title>
          <meta
            name="description"
            content="Review and manage your order before checkout"
          />
        </Helmet>
        <div className="min-h-screen bg-background">
          <EmptyCartState />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`My Order (${itemCount}) - Smart Restaurant`}</title>
        <meta
          name="description"
          content="Review your order and proceed to checkout"
        />
      </Helmet>
      <div className="min-h-screen bg-background">

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
              My Order
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Review your order and proceed to checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <TableVerification
                tableNumber={tableNumber}
                tableDetails={tableDetails}
              />

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                    Your Items ({itemCount})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => navigate("/customer/menu-browse")}
                  >
                    Add More
                  </Button>
                </div>

                {/* Always show current cart items */}
                {cartItems?.map((item) => (
                  <CartItemCard
                    key={item?.cartId}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              <SpecialInstructionsSection
                value={specialInstructions}
                onChange={setSpecialInstructions}
              />

              {/* Bill Details Section - Appears after waiter creates bill */}
              {activeOrder?.bill && (
                <>
                  <div className="bg-primary/5 border-2 border-primary rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Icon name="Receipt" size={18} />
                      Bill Ready - Please review and proceed with payment below
                    </p>
                  </div>
                  <BillPaymentSection 
                    order={activeOrder} 
                    onPay={handlePayment}
                  />
                </>
              )}

              {/* Only show payment method selector if no bill yet */}
              {!activeOrder?.bill && (
                <PaymentMethodSelector
                  onPaymentMethodChange={handlePaymentMethodChange}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4 md:space-y-6">
                <OrderSummary
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  itemCount={itemCount}
                  estimatedTime={getEstimatedWaitTime()}
                />

                <Button
                  variant="default"
                  size="lg"
                  fullWidth
                  iconName="CreditCard"
                  iconPosition="left"
                  onClick={handleCheckout}
                  loading={isProcessing}
                  disabled={!paymentMethod}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  iconName="ArrowLeft"
                  iconPosition="left"
                  onClick={() => navigate("/customer/menu-browse")}
                >
                  Continue Shopping
                </Button>

                <div className="bg-muted/50 rounded-lg p-4 md:p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon
                      name="Truck"
                      size={20}
                      className="text-primary flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm md:text-base font-medium text-foreground mb-1">
                        Table Service
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Your order will be delivered to your table
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon
                      name="RefreshCw"
                      size={20}
                      className="text-primary flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm md:text-base font-medium text-foreground mb-1">
                        Multiple Orders
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        You can place additional orders during your meal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Icon
                      name="Shield"
                      size={20}
                      className="text-primary flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-sm md:text-base font-medium text-foreground mb-1">
                        Secure Payment
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        All transactions are encrypted and secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-card w-full max-w-sm rounded-xl border-2 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${modalState.type === 'error' ? 'border-error/50' :
              modalState.type === 'success' ? 'border-success/50' : 'border-primary/50'
            }`}>
            <div className={`p-4 flex items-center gap-3 ${modalState.type === 'error' ? 'bg-error/10 border-b border-error/20' :
                modalState.type === 'success' ? 'bg-success/10 border-b border-success/20' : 'bg-primary/10 border-b border-primary/20'
              }`}>
              <div className={`p-2 rounded-full ${modalState.type === 'error' ? 'bg-error/20 text-error' :
                  modalState.type === 'success' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                }`}>
                <Icon name={
                  modalState.type === 'error' ? 'AlertTriangle' :
                    modalState.type === 'success' ? 'CheckCircle' : 'Info'
                } size={24} />
              </div>
              <div>
                <h3 className={`font-bold text-lg leading-tight ${modalState.type === 'error' ? 'text-error' :
                    modalState.type === 'success' ? 'text-success' : 'text-primary'
                  }`}>
                  {modalState.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-foreground text-sm leading-relaxed">
                {modalState.message}
              </p>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex gap-3 justify-end">
              {modalState.type === 'confirm' ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={() => {
                      if (modalState.onConfirm) modalState.onConfirm();
                      closeModal();
                    }}
                    variant="default"
                    size="sm"
                  >
                    Confirm
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    if (modalState.onConfirm) modalState.onConfirm();
                    closeModal();
                  }}
                  variant={modalState.type === 'error' ? 'destructive' : 'default'}
                  fullWidth
                >
                  {modalState.type === 'success' ? 'Awesome!' : 'Close'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingCart;
