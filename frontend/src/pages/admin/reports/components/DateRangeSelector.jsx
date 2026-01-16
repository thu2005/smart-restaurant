import React from 'react';

const DateRangeSelector = ({ value, onChange }) => {
    const presetRanges = [
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'thisMonth', label: 'This Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'custom', label: 'Custom Range' },
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
