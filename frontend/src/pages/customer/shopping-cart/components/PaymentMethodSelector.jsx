import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";

import Input from "../../../../components/ui/Input";
import { Checkbox } from "../../../../components/ui/Checkbox";

const PaymentMethodSelector = ({ onPaymentMethodChange }) => {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [saveCard, setSaveCard] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Notify parent of default selection on mount
  React.useEffect(() => {
      onPaymentMethodChange(selectedMethod);
  }, []);

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

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onPaymentMethodChange(method);
  };

  const handleCardSelect = (cardId) => {
    onPaymentMethodChange({ type: "saved_card", cardId });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Icon name="CreditCard" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Payment Method
        </h3>
      </div>
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <button
          onClick={() => handleMethodSelect("card")}
          className={`
            w-full flex items-center justify-between p-3 md:p-4 rounded-md border-2 transition-smooth touch-target
            ${
              selectedMethod === "card"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${
                selectedMethod === "card"
                  ? "border-primary"
                  : "border-muted-foreground"
              }
            `}
            >
              {selectedMethod === "card" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <Icon name="CreditCard" size={20} className="text-foreground" />
            <span className="text-sm md:text-base font-medium text-foreground">
              Credit/Debit Card
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Lock" size={16} className="text-success" />
            <span className="text-xs md:text-sm text-success font-medium">
              Secure
            </span>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect("cash")}
          className={`
            w-full flex items-center justify-between p-3 md:p-4 rounded-md border-2 transition-smooth touch-target
            ${
              selectedMethod === "cash"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${
                selectedMethod === "cash"
                  ? "border-primary"
                  : "border-muted-foreground"
              }
            `}
            >
              {selectedMethod === "cash" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <Icon name="Banknote" size={20} className="text-foreground" />
            <span className="text-sm md:text-base font-medium text-foreground">
              Pay at Counter
            </span>
          </div>
        </button>
      </div>
      {selectedMethod === "card" && (
        <div className="space-y-4 md:space-y-6">
          {savedCards?.length > 0 && (
            <div>
              <h4 className="text-sm md:text-base font-medium text-foreground mb-3">
                Saved Cards
              </h4>
              <div className="space-y-2 md:space-y-3">
                {savedCards?.map((card) => (
                  <button
                    key={card?.id}
                    onClick={() => handleCardSelect(card?.id)}
                    className="w-full flex items-center justify-between p-3 md:p-4 bg-muted rounded-md hover:bg-muted/80 transition-smooth touch-target"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name="CreditCard"
                        size={20}
                        className="text-foreground"
                      />
                      <div className="text-left">
                        <p className="text-sm md:text-base font-medium text-foreground">
                          {card?.brand} •••• {card?.last4}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Expires {card?.expiry}
                        </p>
                      </div>
                    </div>
                    {card?.isDefault && (
                      <span className="text-xs md:text-sm px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                        Default
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="my-4 md:my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  OR
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm md:text-base font-medium text-foreground mb-3 md:mb-4">
              Add New Card
            </h4>
            <div className="space-y-3 md:space-y-4">
              <Input
                label="Card Number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails?.number}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, number: e?.target?.value })
                }
                maxLength={19}
              />
              <Input
                label="Cardholder Name"
                type="text"
                placeholder="John Doe"
                value={cardDetails?.name}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, name: e?.target?.value })
                }
              />
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Input
                  label="Expiry Date"
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails?.expiry}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, expiry: e?.target?.value })
                  }
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  type="text"
                  placeholder="123"
                  value={cardDetails?.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e?.target?.value })
                  }
                  maxLength={4}
                />
              </div>
              <Checkbox
                label="Save this card for future orders"
                checked={saveCard}
                onChange={(e) => setSaveCard(e?.target?.checked)}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 md:p-4 bg-muted/50 rounded-md">
            <Icon
              name="Shield"
              size={18}
              className="text-success flex-shrink-0 mt-0.5"
            />
            <p className="text-xs md:text-sm text-foreground">
              Your payment information is encrypted and secure. We use Stripe
              for payment processing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
