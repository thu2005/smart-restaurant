import React, { useState, useEffect } from "react";

const RejectModal = ({ isOpen, onClose, onConfirm, order }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setReason("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError("Please provide a rejection reason");
            return;
        }
        onConfirm(reason);
        onClose();
    };

    if (!isOpen) return null;

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
                    Reject Order
                </h2>

                <p className="text-sm text-muted-foreground mb-4">
                    Order: <span className="font-semibold text-foreground">{order?.orderNumber}</span>
                    <br />
                    Table: <span className="font-semibold text-foreground">T{order?.table?.tableNumber}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="reason"
                            className="block text-sm font-medium text-foreground mb-2"
                        >
                            Rejection Reason <span className="text-error">*</span>
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError("");
                            }}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${error ? "border-error" : "border-border"
                                }`}
                            rows="4"
                            placeholder="e.g., Out of stock, Kitchen closed, etc."
                        />
                        {error && <p className="text-error text-xs mt-1">{error}</p>}
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
                            className="flex-1 px-4 py-2.5 md:py-3 bg-error text-error-foreground hover:bg-error/90 rounded-lg font-semibold text-sm transition-smooth"
                        >
                            Confirm Reject
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectModal;
