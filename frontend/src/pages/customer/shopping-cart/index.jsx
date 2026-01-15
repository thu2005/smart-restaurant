import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useCart } from "../../../contexts/CartContext";
import orderService from "../../../services/orderService";
import authService from "../../../services/authService";
import CustomerOrderProgress from "../../../components/navigation/CustomerOrderProgress";
import CartItemCard from "./components/CartItemCard";
import OrderSummary from "./components/OrderSummary";
import SpecialInstructionsSection from "./components/SpecialInstructionsSection";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import TableVerification from "./components/TableVerification";
import EmptyCartState from "./components/EmptyCartState";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartSummary } = useCart();
  const user = authService.getCurrentUser();

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [tableNumber] = useState(localStorage.getItem("tableNumber") || "N/A");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateQuantity = (cartId, newQuantity) => {
    updateQuantity(cartId, newQuantity);
  };

  const handleRemoveItem = (cartId) => {
    removeFromCart(cartId);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleTableEdit = () => {
    navigate("/customer/menu-browse");
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Use smart placeOrder method that handles create/add logic
      const result = await orderService.placeOrder(cartItems, {
        customerName: user?.fullName || localStorage.getItem("customerName") || "Guest",
        customerPhone: user?.phone || localStorage.getItem("customerPhone") || "",
        specialInstructions: specialInstructions,
      });

      if (result.success) {
        // Clear cart after successful order
        clearCart();
        
        alert(`Order placed successfully! Order #${result.data?.orderNumber || result.data?.id}`);
        navigate("/customer/order-status-tracking");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { itemCount, subtotal, tax, total } = getCartSummary();

  if (cartItems.length === 0) {
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
          <CustomerOrderProgress />
          <EmptyCartState />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${itemCount}) - Smart Restaurant`}</title>
        <meta
          name="description"
          content="Review your order and proceed to checkout"
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <CustomerOrderProgress />

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Review your order and proceed to checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <TableVerification
                tableNumber={tableNumber}
                onEdit={handleTableEdit}
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

              <PaymentMethodSelector
                onPaymentMethodChange={handlePaymentMethodChange}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4 md:space-y-6">
                <OrderSummary
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  itemCount={itemCount}
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
    </>
  );
};

export default ShoppingCart;
