import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const OverviewMetrics = ({ metrics }) => {
    const getChangeIcon = (changeType) => {
        if (changeType === 'positive') return <TrendingUp className="w-4 h-4" />;
        if (changeType === 'negative') return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getChangeColor = (changeType) => {
        if (changeType === 'positive') return 'text-success';
        if (changeType === 'negative') return 'text-error';
        return 'text-muted-foreground';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm hover:shadow-warm-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${metric.iconColor}15` }}
                        >
                            <span className="text-2xl" style={{ color: metric.iconColor }}>
                                {metric.icon === 'DollarSign' && '💵'}
                                {metric.icon === 'ShoppingBag' && '🛍️'}
                                {metric.icon === 'TrendingUp' && '📈'}
                                {metric.icon === 'Clock' && '⏱️'}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-sm text-muted-foreground mb-1 font-medium">
                        {metric.title}
                    </h3>

                    <p className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2 data-text">
                        {metric.value}
                    </p>

                    <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                        {getChangeIcon(metric.changeType)}
                        <span>{metric.change}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OverviewMetrics;
