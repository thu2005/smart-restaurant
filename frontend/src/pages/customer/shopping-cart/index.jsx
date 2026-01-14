import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
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

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Grilled Salmon with Herbs",
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1017a97cd-1765873722883.png",
      imageAlt:
        "Perfectly grilled salmon fillet with fresh herbs and lemon on white ceramic plate with roasted vegetables",
      price: 24.99,
      quantity: 2,
      modifiers: [
        { name: "Size", value: "Regular" },
        { name: "Cooking", value: "Medium" },
      ],

      specialInstructions: "No garlic please",
    },
    {
      id: 2,
      name: "Caesar Salad",
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
      imageAlt:
        "Fresh Caesar salad with crispy romaine lettuce, parmesan cheese shavings, croutons and creamy dressing in white bowl",
      price: 12.99,
      quantity: 1,
      modifiers: [{ name: "Dressing", value: "On the side" }],

      specialInstructions: "",
    },
    {
      id: 3,
      name: "Margherita Pizza",
      image: "https://images.unsplash.com/photo-1703784022146-b72677752ce5",
      imageAlt:
        "Traditional Margherita pizza with fresh mozzarella, basil leaves and tomato sauce on thin crispy crust",
      price: 18.99,
      quantity: 1,
      modifiers: [
        { name: "Size", value: "Large" },
        { name: "Crust", value: "Thin" },
      ],

      specialInstructions: "Extra basil",
    },
  ]);

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [tableNumber] = useState(12);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems?.map((item) =>
        item?.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) =>
      prevItems?.filter((item) => item?.id !== itemId)
    );
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleTableEdit = () => {
    navigate("/customer/menu-browse");
  };

  const calculateSubtotal = () => {
    return cartItems?.reduce(
      (sum, item) => sum + item?.price * item?.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      alert("Order placed successfully! Redirecting to order tracking...");
      navigate("/customer/menu-browse");
    }, 2000);
  };

  const subtotal = calculateSubtotal();
  const itemCount = cartItems?.reduce((sum, item) => sum + item?.quantity, 0);

  if (cartItems?.length === 0) {
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
                    key={item?.id}
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
                  tax={subtotal * 0.08}
                  total={subtotal * 1.08}
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
