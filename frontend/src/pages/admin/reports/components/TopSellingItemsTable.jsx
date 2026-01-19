import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TopSellingItemsTable = ({ items, onViewAll }) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    if (!items || items.length === 0) {
        return (
            <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
                <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
                    {t('reports.topItems.title')}
                </h3>
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    {t('reports.topItems.noData')}
                </div>
            </div>
        );
    }

    const getRankBadgeClass = (rank) => {
        if (rank === 1) return 'bg-yellow-500 text-white'; // Gold
        if (rank === 2) return 'bg-gray-400 text-white'; // Silver
        if (rank === 3) return 'bg-amber-700 text-white'; // Bronze
        return 'bg-muted text-muted-foreground';
    };

    return (
        <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-1">
                        {t('reports.topItems.title')}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        {t('reports.topItems.subtitle')}
                    </p>
                </div>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                        View All →
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('reports.topItems.rank')}
                            </th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('reports.topItems.item')}
                            </th>
                            <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('reports.topItems.category')}
                            </th>
                            <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('reports.topItems.orders')}
                            </th>
                            <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('reports.topItems.revenue')}
                            </th>
                            <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('reports.topItems.trend')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => {
                            const rank = index + 1;
                            // Calculate trend (mock for now - you can enhance this with actual previous period data)
                            const trendValue = Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10);
                            const isPositive = trendValue >= 0;

                            return (
                                <tr key={item.menuItemId || index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-2">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeClass(rank)}`}>
                                            {rank}
                                        </span>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        // Fallback to placeholder if image fails to load
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            {/* Fallback placeholder */}
                                            <div
                                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                                                style={{ display: item.image ? 'none' : 'flex' }}
                                            >
                                                <span className="text-lg font-bold text-primary">
                                                    {item.name?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <span className="font-medium text-foreground">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2 text-muted-foreground">
                                        {item.category}
                                    </td>
                                    <td className="py-4 px-2 text-right font-semibold text-foreground data-text">
                                        {item.orderCount || item.totalQuantity}
                                    </td>
                                    <td className="py-4 px-2 text-right font-semibold text-foreground data-text">
                                        {formatCurrency(item.revenue || item.totalRevenue)}
                                    </td>
                                    <td className="py-4 px-2 text-right">
                                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {Math.abs(trendValue)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopSellingItemsTable;
