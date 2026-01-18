import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../contexts/CurrencyContext";
import Button from "../../../components/ui/Button";

const OrderDetailsModal = ({ isOpen, onClose, order, onCreateBill, bill, onPrintBill, onApplyDiscount }) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [isCreatingBill, setIsCreatingBill] = useState(false);

    if (!isOpen || !order) return null;

    const handleCreateBill = async () => {
        setIsCreatingBill(true);
        try {
            await onCreateBill(order);
            onClose();
        } catch (error) {
            console.error("Failed to create bill:", error);
        } finally {
            setIsCreatingBill(false);
        }
    };



    // Calculate totals
    const subtotal = bill
        ? Number(bill.subtotal)
        : (order.orderItems?.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0) || 0);

    const discount = bill
        ? Number(bill.discount || 0)
        : (Number(order.discount) || 0);

    const tax = bill
        ? Number(bill.tax)
        : ((subtotal - discount) * 0.1);

    const total = bill
        ? Number(bill.total)
        : (subtotal - discount + tax);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-700 to-primary px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{t("waiter.orderDetails.title")}</h2>
                            <p className="text-green-50 text-sm mt-1">
                                {order.orderNumber} • {t("waiter.orderDetails.table", { number: order.table?.tableNumber })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Customer Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">{t("waiter.orderDetails.customerInfo")}</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">{t("waiter.orderDetails.name")}:</span>
                                    <span className="ml-2 font-medium">{order.customerName || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">{t("waiter.orderDetails.phone")}:</span>
                                    <span className="ml-2 font-medium">{order.customerPhone || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">{t("waiter.orderDetails.items")}</h3>
                            <div className="space-y-3">
                                {order.orderItems?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.menuItem?.name || item.name}</p>
                                            <p className="text-sm text-gray-600">{t("waiter.orderDetails.quantity", { count: item.quantity })}</p>
                                            {item.specialInstructions && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    {t("waiter.order.note")}: {item.specialInstructions}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(Number(item.unitPrice) * item.quantity)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatCurrency(item.unitPrice)} each
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bill Summary */}
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-semibold text-gray-900 mb-3">{t("waiter.bill.summary.title")}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t("waiter.bill.summary.subtotal")}:</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>{t("waiter.bill.summary.discount")}:</span>
                                        <span className="font-medium">-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t("waiter.bill.summary.tax")}:</span>
                                    <span className="font-medium">{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>{t("waiter.bill.summary.total")}:</span>
                                    <span className="text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 min-w-[100px] hover:bg-gray-100"
                            disabled={isCreatingBill}
                        >
                            {t("waiter.action.cancel")}
                        </Button>

                        <Button
                            onClick={() => onApplyDiscount(order)}
                            variant="outline"
                            className="flex-1 min-w-[120px] border-green-200 text-green-700 hover:bg-green-50"
                        >
                            {t("waiter.bill.applyDiscount")}
                        </Button>

                        {bill && (
                            <Button
                                onClick={() => onPrintBill(order)}
                                className="flex-1 min-w-[100px] bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                {t("waiter.bill.print")}
                            </Button>
                        )}

                        <Button
                            onClick={handleCreateBill}
                            className="flex-1 min-w-[120px] bg-primary hover:bg-green-800 text-white"
                            disabled={isCreatingBill}
                        >
                            {isCreatingBill ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {t("waiter.processing")}
                                </span>
                            ) : (
                                bill ? t("waiter.bill.create") : t("waiter.bill.create")
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetailsModal;
