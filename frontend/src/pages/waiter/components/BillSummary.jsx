import React from "react";

const BillSummary = ({ bill, compact = false }) => {
    if (!bill) return null;

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    if (compact) {
        return (
            <div className="bg-muted/20 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total:</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(bill.total)}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground mb-3">Bill Summary</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">{formatCurrency(bill.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%):</span>
                    <span className="text-foreground">{formatCurrency(bill.tax)}</span>
                </div>

                {bill.discount > 0 && (
                    <div className="flex justify-between text-success">
                        <span>Discount:</span>
                        <span>-{formatCurrency(bill.discount)}</span>
                    </div>
                )}

                <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground text-base">Total:</span>
                        <span className="font-bold text-lg text-primary">{formatCurrency(bill.total)}</span>
                    </div>
                </div>
            </div>

            {bill.billNumber && (
                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    Bill #{bill.billNumber}
                </div>
            )}
        </div>
    );
};

export default BillSummary;
