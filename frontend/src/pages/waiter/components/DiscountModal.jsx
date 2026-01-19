import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../contexts/CurrencyContext";

const DiscountModal = ({ isOpen, onClose, onConfirm, order, currentBill }) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [discountType, setDiscountType] = useState("percentage"); // "percentage" or "fixed"
    const [discountValue, setDiscountValue] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setDiscountType("percentage");
            setDiscountValue("");
            setError("");
        }
    }, [isOpen]);

    const calculateSubtotal = () => {
        if (currentBill) {
            return parseFloat(currentBill.subtotal);
        }
        if (!order?.orderItems) return 0;
        return order.orderItems.reduce((sum, item) => {
            return sum + parseFloat(item.unitPrice) * item.quantity;
        }, 0);
    };

    const calculateDiscountAmount = () => {
        if (!discountValue) return 0;
        const value = parseFloat(discountValue);
        const subtotal = calculateSubtotal();

        if (discountType === "percentage") {
            return (subtotal * value) / 100;
        }
        return value;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = subtotal * 0.1; // 10% tax
        const discount = calculateDiscountAmount();
        return subtotal + tax - discount;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!discountValue || parseFloat(discountValue) <= 0) {
            setError("Please enter a valid discount value");
            return;
        }

        const discountAmount = calculateDiscountAmount();
        const subtotal = calculateSubtotal();

        if (discountAmount > subtotal) {
            setError("Discount cannot exceed subtotal");
            return;
        }

        onConfirm(discountAmount);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative bg-card rounded-lg shadow-warm-xl max-w-md w-full p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-4">
                    {t("waiter.discount.title")}
                </h2>

                <p className="text-sm text-muted-foreground mb-4">
                    {t("waiter.discount.order")}: <span className="font-semibold text-foreground">{order?.orderNumber}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Discount Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t("waiter.discount.type")}
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="percentage"
                                    checked={discountType === "percentage"}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-foreground">{t("waiter.discount.percentage")}</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="fixed"
                                    checked={discountType === "fixed"}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-foreground">{t("waiter.discount.fixed")}</span>
                            </label>
                        </div>
                    </div>

                    {/* Discount Value */}
                    <div className="mb-4">
                        <label
                            htmlFor="discountValue"
                            className="block text-sm font-medium text-foreground mb-2"
                        >
                            {discountType === "percentage" ? t("waiter.discount.percentage") : t("waiter.discount.amount")} <span className="text-error">*</span>
                        </label>
                        <input
                            id="discountValue"
                            type="number"
                            step="0.01"
                            min="0"
                            value={discountValue}
                            onChange={(e) => {
                                setDiscountValue(e.target.value);
                                setError("");
                            }}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${error ? "border-error" : "border-border"
                                }`}
                            placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 5.00"}
                        />
                        {error && <p className="text-error text-xs mt-1">{error}</p>}
                    </div>

                    {/* Preview */}
                    {discountValue && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="text-foreground">{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (10%):</span>
                                <span className="text-foreground">{formatCurrency(calculateSubtotal() * 0.1)}</span>
                            </div>
                            <div className="flex justify-between text-success">
                                <span>{t("waiter.bill.summary.discount")}:</span>
                                <span>-{formatCurrency(calculateDiscountAmount())}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-border">
                                <span className="text-foreground">{t("waiter.discount.newTotal")}:</span>
                                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>
                    )}

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
                            className="flex-1 px-4 py-2.5 md:py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-sm transition-smooth"
                        >
                            {t("waiter.bill.applyDiscount")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DiscountModal;
