import React, { useState } from "react";
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
  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
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
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    if (dateRange === "year") {
      return date.toLocaleDateString([], { month: "short", year: "2-digit" });
    }
    return value;
  };

  // Transform data to convert revenue from cents to dollars
  const chartData = data?.map(item => ({
    ...item,
    revenueDisplay: (item.revenue || 0) / 100
  })) || [];

  // Debug logging
  console.log("RevenueChart - Raw data:", data);
  console.log("RevenueChart - Transformed chartData:", chartData);

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
              <span className="text-xs text-muted-foreground">Revenue:</span>
              <span className="text-sm font-semibold text-foreground data-text">
                ${(payload?.[0]?.value || 0).toFixed(2)}
              </span>
            </div>
            {payload?.[1] && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground">Orders:</span>
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
            Revenue Analytics
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Sales performance and order trends
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
            No data available for the selected period
          </div>
        ) : (
          <BarChart
            width={800}
            height={300}
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={{stroke: '#1F2937', strokeWidth: 1}}
              axisLine={{stroke: '#1F2937', strokeWidth: 1}}
              tickFormatter={formatXAxis}
              padding={{ left: 30, right: 30 }}
            />
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              fontSize={12}
              tickLine={{stroke: '#1F2937', strokeWidth: 1}}
              axisLine={{stroke: '#1F2937', strokeWidth: 1}}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#1E40AF"
              fontSize={12}
              tickLine={{stroke: '#1F2937', strokeWidth: 1}}
              axisLine={{stroke: '#1F2937', strokeWidth: 1}}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
             <Legend wrapperStyle={{ width: '100%', maxWidth: '100%', textAlign: 'center', margin: '0 auto', display: 'flex', justifyContent: 'center', fontSize: '14px' }} iconType="circle" />
            <Bar
              yAxisId="left"
              dataKey="revenueDisplay"
              fill="#2D5A27"
              radius={[4, 4, 0, 0]}
              name="Revenue ($)"
              barSize={40}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              fill="#1E40AF"
              radius={[4, 4, 0, 0]}
              name="Orders"
              barSize={40}
            />
          </BarChart>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Revenue
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            ${((data?.reduce((sum, item) => sum + item?.revenue, 0) || 0) / 100).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Orders
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            {data?.reduce((sum, item) => sum + item?.orders, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Avg Order Value
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            $
            {(
              ((data?.reduce((sum, item) => sum + item?.revenue, 0) || 0) / 100) /
              (data?.reduce((sum, item) => sum + item?.orders, 0) || 1)
            ).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Peak Hour
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground">
            {formatXAxis(
              data?.reduce(
                (max, item) => (item?.revenue > max?.revenue ? item : max),
                data?.[0] || { name: "" }
              )?.name
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
