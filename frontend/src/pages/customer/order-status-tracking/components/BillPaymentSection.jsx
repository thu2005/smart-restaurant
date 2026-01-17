import React, { useState } from 'react';
import Icon from "../../../../components/AppIcon";
import Input from "../../../../components/ui/Input";
import { Checkbox } from "../../../../components/ui/Checkbox";

const BillPaymentSection = ({ order, onPay }) => {
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
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

    const handlePayClick = async () => {
        setIsProcessing(true);
        console.log('Payment initiated with method:', selectedMethod);
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await onPay(selectedMethod);
        setIsProcessing(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                    <h2 className="text-2xl font-bold text-foreground mb-1">Smart Restaurant</h2>
                    <p className="text-sm text-muted-foreground">
                        Table {order.tableNumber || localStorage.getItem('tableNumber') || 'N/A'} | {formatDate(order.createdAt)}
                    </p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Order #{order.orderNumber || order.id}
                    </h3>
                    <div className="space-y-3">
                        {orderItems.map((item, index) => {
                            const itemPrice = parseFloat(item.price || item.menuItem?.price || 0);
                            const quantity = parseInt(item.quantity || 1);
                            const lineTotal = itemPrice * quantity;

                            return (
                                <div key={index} className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary font-semibold">{quantity}x</span>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {item.menuItem?.name || item.name || 'Item'}
                                                    {item.size && ` (${item.size})`}
                                                </p>
                                                {item.modifiers && item.modifiers.length > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        + {item.modifiers.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-foreground ml-4">
                                        ${lineTotal.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Subtotal, Tax, Total */}
                <div className="space-y-2 pt-4 border-t-2 border-dashed border-gray-300">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-sm text-success">
                            <span>Discount</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-lg font-bold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="CreditCard" size={20} className="text-primary" />
                    Payment Method
                </h3>

                <div className="space-y-3">
                    <button
                        onClick={() => setSelectedMethod("card")}
                        className={`
                            w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                            ${selectedMethod === "card"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "card" ? "border-primary" : "border-muted-foreground"}`}>
                                {selectedMethod === "card" && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <div className="flex items-center gap-3">
                                <Icon name="CreditCard" size={20} className="text-foreground" />
                                <span className="font-medium">Credit/Debit Card</span>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">Secure</span>
                    </button>

                    <button
                        onClick={() => setSelectedMethod("momo")}
                        className={`
                            w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                            ${selectedMethod === "momo"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "momo" ? "border-primary" : "border-muted-foreground"}`}>
                                {selectedMethod === "momo" && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 bg-[#A50064] rounded text-white text-[10px] flex items-center justify-center font-bold">M</span>
                                <span className="font-medium">Momo Wallet</span>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">Fast & Secure</span>
                    </button>

                    <button
                        onClick={() => setSelectedMethod("cash")}
                        className={`
                            w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                            ${selectedMethod === "cash"
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "cash" ? "border-primary" : "border-muted-foreground"}`}>
                                {selectedMethod === "cash" && <div className="w-3 h-3 rounded-full bg-primary" />}
                            </div>
                            <div className="flex items-center gap-3">
                                <Icon name="Banknote" size={20} className="text-foreground" />
                                <span className="font-medium">Pay at Counter</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Card Details Section */}
                {selectedMethod === "card" && (
                    <div className="mt-6 space-y-6 animate-fade-in">
                        {/* Saved Cards */}
                        {savedCards.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-3">Saved Cards</h4>
                                <div className="space-y-3">
                                    {savedCards.map((card) => (
                                        <button
                                            key={card.id}
                                            className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon name="CreditCard" size={20} className="text-foreground" />
                                                <div className="text-left">
                                                    <p className="font-medium text-foreground">{card.brand} •••• {card.last4}</p>
                                                    <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                                                </div>
                                            </div>
                                            {card.isDefault && (
                                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium">Default</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="my-6 flex items-center gap-3">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground">OR</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                            </div>
                        )}

                        {/* Add New Card */}
                        <div>
                            <h4 className="text-sm font-medium text-foreground mb-4">Add New Card</h4>
                            <div className="space-y-4">
                                <Input
                                    label="Card Number"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                    maxLength={19}
                                />
                                <Input
                                    label="Cardholder Name"
                                    placeholder="John Doe"
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Expiry Date"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                        maxLength={5}
                                    />
                                    <Input
                                        label="CVV"
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                        maxLength={4}
                                    />
                                </div>
                                <Checkbox
                                    label="Save this card for future orders"
                                    checked={saveCard}
                                    onChange={(e) => setSaveCard(e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* Secure Note */}
                        <div className="flex items-start gap-2 p-3 bg-success/5 rounded-lg border border-success/10">
                            <Icon name="Shield" size={18} className="text-success flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                                Your payment information is encrypted and secure. We use Stripe for payment processing.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pay Button */}
            <button
                onClick={handlePayClick}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        Pay {total.toLocaleString('vi-VN')}₫
                        <Icon name="ArrowRight" size={18} />
                    </>
                )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
                Secure payment processing by Smart Restaurant
            </p>
        </div>
    );
};

export default BillPaymentSection;
