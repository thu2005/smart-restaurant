import React from "react";
import Select from "../../../../components/ui/Select";
import Button from "../../../../components/ui/Button";

const OrderFilters = ({
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortChange,
  onRefresh,
}) => {
  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "new", label: "New Orders" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready to Serve" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "rush", label: "Rush Orders" },
    { value: "normal", label: "Normal Orders" },
  ];

  const sortOptions = [
    { value: "time-asc", label: "Oldest First" },
    { value: "time-desc", label: "Newest First" },
    { value: "table-asc", label: "Table Number (Low to High)" },
    { value: "priority", label: "Priority First" },
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-warm p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="w-full"
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={priorityFilter}
          onChange={onPriorityFilterChange}
          className="w-full"
        />

        <Select
          label="Sort By"
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          className="w-full"
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            fullWidth
            iconName="RefreshCw"
            iconPosition="left"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
