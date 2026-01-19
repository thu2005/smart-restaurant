import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const PeakHoursChart = ({ data }) => {
    const { t } = useTranslation();
    if (!data || data.length === 0) {
        return (
            <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
                <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
                    {t('reports.charts.peakHours.title')}
                </h3>
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                    {t('reports.charts.peakHours.noData')}
                </div>
            </div>
        );
    }

    // Find the max order count to highlight peak
    const maxOrderCount = Math.max(...data.map(d => d.orderCount));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-warm-lg">
                    <p className="text-sm font-medium text-foreground mb-1">
                        {payload[0].payload.hourLabel}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('reports.charts.peakHours.orders')}:</span>
                        <span className="text-sm font-semibold text-foreground data-text">
                            {payload[0].value}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
            <div className="mb-6">
                <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-1">
                    {t('reports.charts.peakHours.title')}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                    {t('reports.charts.peakHours.subtitle')}
                </p>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" horizontal={false} />
                        <XAxis type="number" stroke="#7f8c8d" fontSize={11} />
                        <YAxis
                            type="category"
                            dataKey="hourLabel"
                            stroke="#7f8c8d"
                            fontSize={11}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="orderCount" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.orderCount === maxOrderCount ? '#e74c3c' : '#3498db'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PeakHoursChart;
