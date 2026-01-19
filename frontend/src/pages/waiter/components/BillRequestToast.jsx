import React, { useEffect } from "react";

const BillRequestToast = ({ notification, onClose, onViewOrder }) => {
    useEffect(() => {
        if (notification) {
            // Auto-dismiss after 8 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 100000);

            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    const { orderNumber, tableNumber, total } = notification;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
            <div className="bg-white border-l-4 border-amber-500 shadow-2xl rounded-lg p-4 min-w-[320px] max-w-[400px]">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Bill Requested</h3>
                            <p className="text-xs text-gray-500 mt-0.5">New customer request</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                        aria-label="Close notification"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="ml-13 space-y-1 mb-3">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Table {tableNumber}</span> ({orderNumber})
                    </p>
                    <p className="text-sm text-gray-600">
                        has requested the bill
                    </p>
                    <p className="text-lg font-bold text-amber-600 mt-2">
                        Total: ${parseFloat(total).toFixed(2)}
                    </p>
                </div>

                {/* Action Button */}
                {onViewOrder && (
                    <div className="ml-13">
                        <button
                            onClick={() => {
                                onViewOrder();
                                onClose();
                            }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            View Order Details
                        </button>
                    </div>
                )}

                {/* Progress bar */}
                <div className="ml-13 mt-3">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 animate-progress" style={{ animationDuration: '8s' }}></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }

                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }

                .animate-progress {
                    animation: progress linear;
                }
            `}</style>
        </div>
    );
};

export default BillRequestToast;
