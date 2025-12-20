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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-warm-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {payload?.[0]?.payload?.name}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Revenue:</span>
              <span className="text-sm font-semibold text-foreground data-text">
                ${payload?.[0]?.value}
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
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm">
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
        className="w-full h-64 md:h-80 lg:h-96"
        aria-label="Revenue Analytics Bar Chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              style={{ fontSize: "12px" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "14px" }} iconType="circle" />
            <Bar
              dataKey="revenue"
              fill="var(--color-primary)"
              radius={[8, 8, 0, 0]}
              name="Revenue ($)"
            />
            <Bar
              dataKey="orders"
              fill="var(--color-accent)"
              radius={[8, 8, 0, 0]}
              name="Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Total Revenue
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
            ${data?.reduce((sum, item) => sum + item?.revenue, 0)?.toFixed(2)}
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
              data?.reduce((sum, item) => sum + item?.revenue, 0) /
              data?.reduce((sum, item) => sum + item?.orders, 0)
            )?.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            Peak Hour
          </p>
          <p className="text-lg md:text-xl font-heading font-bold text-foreground">
            {
              data?.reduce(
                (max, item) => (item?.revenue > max?.revenue ? item : max),
                data?.[0]
              )?.name
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
