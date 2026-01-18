import React from "react";
import { useTranslation } from "react-i18next";

const BillSummary = ({ bill, compact = false }) => {
    const { t } = useTranslation();
    if (!bill) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(parseFloat(amount)) + '₫';
    };

    if (compact) {
        return (
            <div className="bg-muted/20 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">{t("waiter.bill.summary.total")}:</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(bill.total)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground mb-3">{t("waiter.bill.summary.title")}</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("waiter.bill.summary.subtotal")}:</span>
                    <span className="text-foreground">{formatCurrency(bill.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("waiter.bill.summary.tax")}:</span>
                    <span className="text-foreground">{formatCurrency(bill.tax)}</span>
                </div>

                {bill.discount > 0 && (
                    <div className="flex justify-between text-success">
                        <span>{t("waiter.bill.summary.discount")}:</span>
                        <span>-{formatCurrency(bill.discount)}</span>
                    </div>
                )}

                <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground text-base">{t("waiter.bill.summary.total")}:</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(bill.total)}</span>
                    </div>
                </div>
            </div>

            {bill.billNumber && (
                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    {t("waiter.bill.number", { number: bill.billNumber })}
                </div>
            )}
        </div>
    );
};

export default BillSummary;
