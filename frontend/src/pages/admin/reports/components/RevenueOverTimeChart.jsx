import React, { useState } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const RevenueOverTimeChart = ({ data, period, onPeriodChange }) => {
    const periodOptions = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
    ];

    const formatXAxis = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        if (period === 'daily') {
            // Show day of week for daily view
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            return `${dayOfWeek} ${dayNum}`;
        }
        if (period === 'weekly') {
            // Show week start date
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        if (period === 'monthly') {
            // Show month name
            return date.toLocaleDateString('en-US', { month: 'short' });
        }
        return value;
    };

    const formatYAxis = (value) => {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}k`;
        }
        return `$${value}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-warm-lg">
                    <p className="text-sm font-medium text-foreground mb-2">
                        {formatXAxis(label)}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e74c3c' }} />
                            <span className="text-xs text-muted-foreground">Revenue:</span>
                            <span className="text-sm font-semibold text-foreground data-text">
                                ${(payload[0]?.value || 0).toFixed(2)}
                            </span>
                        </div>
                        {payload[1] && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-accent" />
                                <span className="text-xs text-muted-foreground">Orders:</span>
                                <span className="text-sm font-semibold text-foreground data-text">
                                    {payload[1]?.value}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Transform data for chart (revenue in cents to dollars for display)
    const chartData = (data || []).map(item => ({
        ...item,
        revenueDisplay: (item.revenue || 0) / 100,
    }));

    return (
        <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-1">
                        Revenue Over Time
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Track revenue trends across different time periods
                    </p>
                </div>
                <div className="flex gap-2">
                    {periodOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => onPeriodChange(option.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === option.value
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-[300px]">
                {(!chartData || chartData.length === 0) ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No data available for the selected period
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" vertical={false} />
                            <XAxis
                                dataKey="period"
                                stroke="#7f8c8d"
                                fontSize={11}
                                tickLine={{ stroke: '#7f8c8d' }}
                                axisLine={{ stroke: '#7f8c8d' }}
                                tickFormatter={formatXAxis}
                            />
                            <YAxis
                                stroke="#7f8c8d"
                                fontSize={11}
                                tickLine={{ stroke: '#7f8c8d' }}
                                axisLine={{ stroke: '#7f8c8d' }}
                                tickFormatter={formatYAxis}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenueDisplay"
                                stroke="#e74c3c"
                                strokeWidth={3}
                                fill="url(#colorRevenue)"
                                name="Revenue ($)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default RevenueOverTimeChart;
