import React from "react";

const OrderTabs = ({ activeTab, onTabChange, counts = {} }) => {
    const tabs = [
        {
            id: "pending",
            label: "Pending",
            count: counts.pending || 0,
            showBadge: true,
        },
        {
            id: "accepted",
            label: "Accepted",
            count: counts.accepted || 0,
            showBadge: true,
        },
        {
            id: "ready",
            label: "Ready to Serve",
            count: counts.ready || 0,
            showBadge: true,
        },
        {
            id: "tables",
            label: "My Tables",
            count: counts.tables || 0,
            showBadge: true,
        },
    ];

    return (
        <div className="bg-card border-b border-border flex overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
            flex-1 min-w-[100px] px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium
            transition-smooth relative whitespace-nowrap
            ${activeTab === tab.id
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }
          `}
                >
                    <span className="flex items-center justify-center gap-2">
                        {tab.label}
                        {tab.showBadge && tab.count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-error-foreground bg-error rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </span>
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-primary" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default OrderTabs;
