import React, { useState } from "react";

const PaymentModal = ({ isOpen, onClose, onConfirm, bill }) => {
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const paymentMethods = [
        { value: "CASH", label: "Cash", icon: "💵" },
        { value: "CARD_AT_COUNTER", label: "Card", icon: "💳" },
        { value: "ZALOPAY", label: "ZaloPay", icon: "📱" },
        { value: "MOMO", label: "MoMo", icon: "📱" },
        { value: "VNPAY", label: "VNPay", icon: "💰" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(paymentMethod);
        onClose();
    };

    if (!isOpen || !bill) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative bg-card rounded-lg shadow-warm-xl max-w-md w-full p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-4">
                    Process Payment
                </h2>

                {/* Bill Summary */}
                <div className="bg-muted/20 rounded-lg p-4 mb-6 space-y-2">
                    <h3 className="font-semibold text-foreground mb-2">Bill Summary</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="text-foreground">${parseFloat(bill.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax:</span>
                            <span className="text-foreground">${parseFloat(bill.tax).toFixed(2)}</span>
                        </div>
                        {bill.discount > 0 && (
                            <div className="flex justify-between text-success">
                                <span>Discount:</span>
                                <span>-${parseFloat(bill.discount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                            <span className="text-foreground">Total:</span>
                            <span className="text-primary">${parseFloat(bill.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Payment Method Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-3">
                            Payment Method <span className="text-error">*</span>
                        </label>
                        <div className="space-y-2">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.value}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-smooth ${paymentMethod === method.value
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value={method.value}
                                        checked={paymentMethod === method.value}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="text-xl mr-2">{method.icon}</span>
                                    <span className="text-sm font-medium text-foreground">{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 md:py-3 border border-border text-foreground bg-card hover:bg-muted rounded-lg font-semibold text-sm transition-smooth"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 md:py-3 bg-success text-success-foreground hover:bg-success/90 rounded-lg font-semibold text-sm transition-smooth"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
