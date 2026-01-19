import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../../contexts/CurrencyContext';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

const TopItemsModal = ({ items, onClose }) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    if (!items || items.length === 0) return null;

    const getRankBadgeClass = (rank) => {
        if (rank === 1) return 'bg-yellow-500 text-white';
        if (rank === 2) return 'bg-gray-400 text-white';
        if (rank === 3) return 'bg-amber-700 text-white';
        return 'bg-muted text-muted-foreground';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-foreground">
                            {t('reports.topItems.modal.title')}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete list of menu items ranked by revenue
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-card z-10">
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
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
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

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/30">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Showing {items.length} items</span>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            {t('reports.topItems.modal.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopItemsModal;
