import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PaymentModal = ({ isOpen, onClose, onConfirm, bill }) => {
    const { t } = useTranslation();
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const paymentMethods = [
        { value: "CASH", label: t("waiter.payment.methods.cash"), icon: "💵" },
        { value: "CARD_AT_COUNTER", label: t("waiter.payment.methods.card"), icon: "💳" },
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
                    {t("waiter.payment.title")}
                </h2>

                {/* Bill Summary */}
                <div className="bg-muted/20 rounded-lg p-4 mb-6 space-y-2">
                    <h3 className="font-semibold text-foreground mb-2">{t("waiter.bill.summary.title")}</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("waiter.bill.summary.subtotal")}:</span>
                            <span className="text-foreground">{new Intl.NumberFormat('vi-VN').format(parseFloat(bill.subtotal))}₫</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("waiter.bill.summary.tax")}:</span>
                            <span className="text-foreground">{new Intl.NumberFormat('vi-VN').format(parseFloat(bill.tax))}₫</span>
                        </div>
                        {bill.discount > 0 && (
                            <div className="flex justify-between text-success">
                                <span>{t("waiter.bill.summary.discount")}:</span>
                                <span>-{new Intl.NumberFormat('vi-VN').format(parseFloat(bill.discount))}₫</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                            <span className="text-foreground">{t("waiter.bill.summary.total")}:</span>
                            <span className="text-primary">{new Intl.NumberFormat('vi-VN').format(parseFloat(bill.total))}₫</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Payment Method Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-3">
                            {t("waiter.payment.method")} <span className="text-error">*</span>
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
                            {t("waiter.action.cancel")}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 md:py-3 bg-success text-success-foreground hover:bg-success/90 rounded-lg font-semibold text-sm transition-smooth"
                        >
                            {t("waiter.payment.confirm")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
