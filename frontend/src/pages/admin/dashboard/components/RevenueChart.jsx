import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Select from "../../../../components/ui/Select";

const RevenueChart = ({ data, dateRange, onDateRangeChange }) => {
  const { t } = useTranslation();
  const { formatCurrency, currencySymbol } = useCurrency();

  const dateRangeOptions = [
    { value: "today", label: t('admin.dashboard.dateRanges.today') },
    { value: "week", label: t('admin.dashboard.dateRanges.week') },
    { value: "month", label: t('admin.dashboard.dateRanges.month') },
    { value: "year", label: t('admin.dashboard.dateRanges.year') },
  ];

  const formatXAxis = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    if (dateRange === "today") {
      return date.toLocaleTimeString([], { hour: "numeric", hour12: true });
    }
    if (dateRange === "week") {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    if (dateRange === "month") {
      return date.getDate().toString();
    }
    if (dateRange === "year") {
      return date.toLocaleDateString([], { month: "short" });
    }
    return value;
  };

  // Transform data and fill missing time slots
  const processChartData = () => {
    // Basic null check
    const rawData = data || [];
    const fullSlots = [];
    const now = new Date();

    if (dateRange === "today") {
      // Create a map for quick lookup: hour -> item
      const dataMap = {};
      rawData.forEach(item => {
        const d = new Date(item.name);
        if (!isNaN(d.getTime())) {
          dataMap[d.getHours()] = item;
        }
      });

      // Generate slots from 8 AM (8) to 7 PM (19)
      for (let i = 8; i <= 19; i++) {
        const slotDate = new Date();
        slotDate.setHours(i, 0, 0, 0);

        const existingData = dataMap[i];
        if (existingData) {
          fullSlots.push({
            ...existingData,
            revenueDisplay: existingData.revenue || 0
          });
        } else {
          fullSlots.push({
            name: slotDate.toISOString(),
            revenue: 0,
            revenueDisplay: 0,
            orders: 0
          });
        }
      }
      return fullSlots;
    }

    if (dateRange === "week") {
      // "This Week": Mon - Sun
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      // Calculate Monday of this week. If today is Sunday, get Monday of the previous week.
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      monday.setMinutes(0, 0, 0); // Ensure clean start of day

      const dataMap = {};
      rawData.forEach(item => {
        const d = new Date(item.name);
        if (!isNaN(d.getTime())) {
          // Key by YYYY-MM-DD string for matching
          const key = d.toISOString().split('T')[0];
          dataMap[key] = item;
        }
      });

      for (let i = 0; i < 7; i++) {
        const slotDate = new Date(monday);
        slotDate.setDate(monday.getDate() + i);
        const key = slotDate.toISOString().split('T')[0];

        const existingData = dataMap[key];
        if (existingData) {
          fullSlots.push({ ...existingData, revenueDisplay: existingData.revenue || 0 });
        } else {
          fullSlots.push({
            name: slotDate.toISOString(),
            revenue: 0,
            revenueDisplay: 0,
            orders: 0
          });
        }
      }
      return fullSlots;
    }

    if (dateRange === "month") {
      // "This Month": 1st to End of Month
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get last day of current month

      const dataMap = {};
      rawData.forEach(item => {
        const d = new Date(item.name);
        if (!isNaN(d.getTime())) {
          dataMap[d.getDate()] = item; // Key by day of month (1-31)
        }
      });

      for (let i = 1; i <= daysInMonth; i++) {
        const slotDate = new Date(year, month, i);
        slotDate.setHours(0, 0, 0, 0); // Ensure clean start of day
        const existingData = dataMap[i];

        if (existingData) {
          fullSlots.push({ ...existingData, revenueDisplay: existingData.revenue || 0 });
        } else {
          fullSlots.push({
            name: slotDate.toISOString(),
            revenue: 0,
            revenueDisplay: 0,
            orders: 0
          });
        }
      }
      return fullSlots;
    }

    if (dateRange === "year") {
      // "This Year": Jan - Dec
      const year = now.getFullYear();
      const dataMap = {};
      rawData.forEach(item => {
        const d = new Date(item.name);
        if (!isNaN(d.getTime())) {
          dataMap[d.getMonth()] = item; // Key by month index (0-11)
        }
      });

      for (let i = 0; i < 12; i++) {
        const slotDate = new Date(year, i, 1); // First day of each month
        slotDate.setHours(0, 0, 0, 0); // Ensure clean start of day
        const existingData = dataMap[i];

        if (existingData) {
          fullSlots.push({ ...existingData, revenueDisplay: existingData.revenue || 0 });
        } else {
          fullSlots.push({
            name: slotDate.toISOString(),
            revenue: 0,
            revenueDisplay: 0,
            orders: 0
          });
        }
      }
      return fullSlots;
    }

    // Default behavior for other ranges or if no specific range matches
    return rawData.map(item => ({
      ...item,
      revenueDisplay: item.revenue || 0
    }));
  };

  const chartData = processChartData();

  // Debug logging
  console.log("RevenueChart - Raw data:", data);
  console.log("RevenueChart - Processed chartData:", chartData);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-warm-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {formatXAxis(label)}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">{t('admin.dashboard.revenue.series.revenue')}:</span>
              <span className="text-sm font-semibold text-foreground data-text">
                {formatCurrency(payload?.[0]?.value || 0)}
              </span>
            </div>
            {payload?.[1] && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground">{t('admin.dashboard.revenue.series.orders')}:</span>
                <span className="text-sm font-semibold text-foreground data-text">
                  {payload?.[1]?.value}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm max-h-[600px] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-1">
            {t('admin.dashboard.revenue.title')}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {t('admin.dashboard.revenue.subtitle')}
          </p>
        </div>
        <Select
          options={dateRangeOptions}
          value={dateRange}
          onChange={onDateRangeChange}
          className="w-full sm:w-40"
        />
      </div>
      <div
        className="w-full h-[320px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed border-border/50"
        aria-label="Revenue Analytics Bar Chart"
      >
        {(!chartData || chartData.length === 0) ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {t('admin.dashboard.revenue.noData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                tickLine={{ stroke: '#1F2937', strokeWidth: 1 }}
                axisLine={{ stroke: '#1F2937', strokeWidth: 1 }}
                tickFormatter={formatXAxis}
                padding={{ left: 0, right: 0 }}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                tickLine={{ stroke: '#1F2937', strokeWidth: 1 }}
                axisLine={{ stroke: '#1F2937', strokeWidth: 1 }}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#1E40AF"
                fontSize={12}
                tickLine={{ stroke: '#1F2937', strokeWidth: 1 }}
                axisLine={{ stroke: '#1F2937', strokeWidth: 1 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} offset={10} />
              <Legend wrapperStyle={{ width: '100%', maxWidth: '100%', textAlign: 'center', margin: '0 auto', display: 'flex', justifyContent: 'center', fontSize: '14px' }} iconType="circle" />
              <Bar
                yAxisId="left"
                dataKey="revenueDisplay"
                fill="#2D5A27"
                radius={[4, 4, 0, 0]}
                name={`${t('admin.dashboard.revenue.series.revenue')} (${currencySymbol})`}
                barSize={40}
              />
              <Bar
                yAxisId="right"
                dataKey="orders"
                fill="#1E40AF"
                radius={[4, 4, 0, 0]}
                name={t('admin.dashboard.revenue.series.orders')}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {t('admin.dashboard.revenue.totalRevenue')}
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            {formatCurrency(Math.round(data?.reduce((sum, item) => sum + item?.revenue, 0) || 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {t('admin.dashboard.revenue.totalOrders')}
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            {data?.reduce((sum, item) => sum + item?.orders, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {t('admin.dashboard.metrics.avgOrderValue')}
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            {formatCurrency(
              Math.round(
                (data?.reduce((sum, item) => sum + item?.revenue, 0) || 0) /
                (data?.reduce((sum, item) => sum + item?.orders, 0) || 1)
              )
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {dateRange === 'today' && t('admin.dashboard.chart.peakHour')}
            {dateRange === 'week' && t('admin.dashboard.chart.peakDate')}
            {dateRange === 'month' && t('admin.dashboard.chart.peakDate')}
            {dateRange === 'year' && t('admin.dashboard.chart.peakMonth')}
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground">
            {(() => {
              const peak = chartData?.reduce(
                (max, item) => (Number(item?.orders || 0) > Number(max?.orders || 0) ? item : max),
                chartData?.[0] || { name: "" }
              );
              if (!peak?.name) return '';
              const date = new Date(peak.name);
              if (isNaN(date.getTime())) return peak.name;
              if (dateRange === 'today') {
                return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
              }
              if (dateRange === 'week' || dateRange === 'month') {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              }
              if (dateRange === 'year') {
                return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
              }
              return peak.name;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
