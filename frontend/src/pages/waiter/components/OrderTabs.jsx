import React from "react";
import { useTranslation } from "react-i18next";

const OrderTabs = ({ activeTab, onTabChange, counts = {} }) => {
    const { t } = useTranslation();
    const tabs = [
        {
            id: "pending",
            label: t("waiter.tabs.pending"),
            count: counts.pending || 0,
            showBadge: true,
        },
        {
            id: "accepted",
            label: t("waiter.tabs.accepted"),
            count: counts.accepted || 0,
            showBadge: true,
        },
        {
            id: "ready",
            label: t("waiter.tabs.ready"),
            count: counts.ready || 0,
            showBadge: true,
        },
        {
            id: "tables",
            label: t("waiter.tabs.tables"),
            count: counts.tables || 0,
            showBadge: true,
        },
        {
            id: "completed",
            label: t("waiter.tabs.completed"),
            count: counts.completed || 0,
            showBadge: true, // Enable badge for completed
        },
    ];

    return (
        <div className="sticky top-14 md:top-16 z-[90] bg-card border-b border-border flex overflow-x-auto shadow-sm">
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
