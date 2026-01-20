import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import Icon from "../../../../components/AppIcon";
import Input from "../../../../components/ui/Input";
import { Checkbox } from "../../../../components/ui/Checkbox";
import StripePaymentWrapper from "../../../../components/payment/StripePaymentWrapper";
import axios from "axios";

const BillPaymentSection = ({ order, onPay }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [saveCard, setSaveCard] = useState(false);

  const bill = order.bill || {};
  const total = parseFloat(bill.total || 0);
  const subtotal = parseFloat(bill.subtotal || 0);
  const tax = parseFloat(bill.tax || 0);
  const discount = parseFloat(bill.discount || 0);

  const savedCards = [
    {
      id: "card_1",
      last4: "4242",
      brand: "Visa",
      expiry: "12/25",
      isDefault: true,
    },
    {
      id: "card_2",
      last4: "5555",
      brand: "Mastercard",
      expiry: "08/26",
      isDefault: false,
    },
  ];

  // Create PaymentIntent when card method is selected
  useEffect(() => {
    if (selectedMethod === "card" && !stripeClientSecret && !loadingIntent) {
      createStripePaymentIntent();
    }
  }, [selectedMethod]);

  const createStripePaymentIntent = async () => {
    setLoadingIntent(true);
    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.post(
        `${API_URL}/payments/stripe/create-intent`,
        {
          orderId: order.id,
          restaurantId:
            order.restaurantId || localStorage.getItem("restaurantId"),
          amount: subtotal,
          tax: tax,
          tip: 0,
        },
      );

      if (response.data.success) {
        setStripeClientSecret(response.data.data.clientSecret);
      }
    } catch (error) {
      console.error("Error creating PaymentIntent:", error);
    } finally {
      setLoadingIntent(false);
    }
  };

  const handleStripeSuccess = async (paymentIntent) => {
    console.log("✅ Stripe payment succeeded:", paymentIntent.id);
    setIsProcessing(true);
    try {
      // Confirm payment status with backend
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${API_URL}/payments/stripe/confirm`, {
        paymentIntentId: paymentIntent.id,
      });

      if (response.data.success) {
        // Payment confirmed - just show success message, no need to call onPay
        console.log("Payment confirmed successfully");

        // Show success notification
        window.location.reload(); // Simple reload to refresh order status
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert(
        "Payment succeeded but confirmation failed. Please refresh the page.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeError = (error) => {
    console.error("❌ Stripe payment failed:", error);
    setIsProcessing(false);
  };

  const handlePayClick = async () => {
    if (selectedMethod === "card") {
      // Stripe payment is handled by StripeCardForm submit
      return;
    }

    setIsProcessing(true);
    console.log("💳 Payment initiated with method:", selectedMethod);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await onPay(selectedMethod);
    setIsProcessing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString)
      return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const orderItems = order.orderItems || order.items || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bill Header - Restaurant Info */}
      <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-lg">
        {/* Restaurant Icon & Name */}
        <div className="text-center mb-4 pb-4 border-b border-gray-200">
          <div className="flex justify-center gap-3 mb-3">
            <Icon name="UtensilsCrossed" size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {t(
              "customer.orderTracking.bill.restaurantName",
              "Smart Restaurant",
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("customer.orderTracking.bill.tableDate", {
              table:
                order.tableNumber ||
                localStorage.getItem("tableNumber") ||
                "N/A",
              date: formatDate(order.createdAt),
            })}
          </p>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {t("customer.orderTracking.bill.orderNumber", {
              number: order.orderNumber || order.id,
            })}
          </h3>
          <div className="space-y-3">
            {orderItems.map((item, index) => {
              const itemPrice = parseFloat(
                item.price || item.menuItem?.price || 0,
              );
              const quantity = parseInt(item.quantity || 1);
              const lineTotal = itemPrice * quantity;

              return (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <span className="text-primary font-semibold">
                        {quantity}x
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.menuItem?.name || item.name || "Item"}
                          {item.size && ` (${item.size})`}
                        </p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            + {item.modifiers.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground ml-4 data-text">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtotal, Tax, Total */}
        <div className="space-y-2 pt-4 border-t-2 border-dashed border-gray-300">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("customer.orderTracking.bill.subtotal")}</span>
            <span className="data-text">{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>{t("customer.orderTracking.bill.discount")}</span>
              <span className="data-text">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("customer.orderTracking.bill.tax")}</span>
            <span className="data-text">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-lg font-bold text-foreground">
              {t("customer.orderTracking.bill.total")}
            </span>
            <span className="text-2xl font-bold text-primary data-text">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="CreditCard" size={20} className="text-primary" />
          {t("customer.cart.paymentMethod.title", "Payment Method")}
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => setSelectedMethod("card")}
            className={`
                            w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                            ${
                              selectedMethod === "card"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }
                        `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "card" ? "border-primary" : "border-muted-foreground"}`}
              >
                {selectedMethod === "card" && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Icon name="CreditCard" size={20} className="text-foreground" />
                <span className="font-medium">
                  {t("customer.cart.paymentMethod.card", "Credit/Debit Card")}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
              {t("customer.cart.paymentMethod.secure", "Secure")}
            </span>
          </button>

          <button
            onClick={() => setSelectedMethod("momo")}
            className={`
                            w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                            ${
                              selectedMethod === "momo"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }
                        `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "momo" ? "border-primary" : "border-muted-foreground"}`}
              >
                {selectedMethod === "momo" && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 bg-[#A50064] rounded text-white text-[10px] flex items-center justify-center font-bold">
                  M
                </span>
                <span className="font-medium">
                  {t("customer.cart.paymentMethod.momo", "Momo Wallet")}
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {t("customer.cart.paymentMethod.fastSecure", "Fast & Secure")}
            </span>
          </button>

          <button
            onClick={() => setSelectedMethod("cash")}
            className={`
                            w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                            ${
                              selectedMethod === "cash"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }
                        `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "cash" ? "border-primary" : "border-muted-foreground"}`}
              >
                {selectedMethod === "cash" && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Banknote" size={20} className="text-foreground" />
                <span className="font-medium">
                  {t("customer.cart.paymentMethod.cash", "Pay at Counter")}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Card Details Section - Stripe Integration */}
        {selectedMethod === "card" && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {loadingIntent ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Initializing secure payment...
                </p>
              </div>
            ) : (
              <StripePaymentWrapper
                clientSecret={stripeClientSecret}
                amount={total}
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
              />
            )}
          </div>
        )}
      </div>

      {/* Pay Button for Non-Card Methods */}
      {selectedMethod !== "card" && (
        <>
          <button
            onClick={handlePayClick}
            disabled={isProcessing}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t(
                  "customer.orderTracking.bill.processing",
                  "Processing Payment...",
                )}
              </>
            ) : (
              <>
                {selectedMethod === "momo"
                  ? t(
                      "customer.orderTracking.bill.continueMomo",
                      "Continue to MoMo",
                    )
                  : t("customer.orderTracking.bill.payButton", {
                      amount: formatCurrency(total),
                    })}
                <Icon name="ArrowRight" size={18} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {t(
              "customer.orderTracking.bill.securePayment",
              "Secure payment processing by Smart Restaurant",
            )}
          </p>
        </>
      )}
    </div>
  );
};

export default BillPaymentSection;
