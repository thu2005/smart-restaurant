import React from 'react';
import { useTranslation } from 'react-i18next';

const DateRangeSelector = ({ value, onChange }) => {
    const { t } = useTranslation();

    const presetRanges = [
        { value: 'last7days', label: t('reports.dateRange.last7days') },
        { value: 'last30days', label: t('reports.dateRange.last30days') },
        { value: 'thisMonth', label: t('reports.dateRange.thisMonth') },
        { value: 'lastMonth', label: t('reports.dateRange.lastMonth') },
        { value: 'custom', label: t('reports.dateRange.custom') },
    ];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:bg-muted/50"
        >
            {presetRanges.map(range => (
                <option key={range.value} value={range.value}>
                    {range.label}
                </option>
            ))}
        </select>
    );
};

export default DateRangeSelector;
