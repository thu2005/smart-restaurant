import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const statusOptions = [
    { value: "all", label: t('kitchen.filters.status.all') },
    { value: "new", label: t('kitchen.filters.status.new') },
    { value: "preparing", label: t('kitchen.filters.status.preparing') },
    { value: "ready", label: t('kitchen.filters.status.ready') },
  ];

  const priorityOptions = [
    { value: "all", label: t('kitchen.filters.priority.all') },
    { value: "rush", label: t('kitchen.filters.priority.rush') },
    { value: "normal", label: t('kitchen.filters.priority.normal') },
  ];

  const sortOptions = [
    { value: "time-asc", label: t('kitchen.filters.sort.oldest') },
    { value: "time-desc", label: t('kitchen.filters.sort.newest') },
    { value: "table-asc", label: t('kitchen.filters.sort.table') },
    { value: "priority", label: t('kitchen.filters.sort.priority') },
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-warm p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label={t('kitchen.filters.labels.status')}
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="w-full"
        />

        <Select
          label={t('kitchen.filters.labels.priority')}
          options={priorityOptions}
          value={priorityFilter}
          onChange={onPriorityFilterChange}
          className="w-full"
        />

        <Select
          label={t('kitchen.filters.labels.sort')}
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
            {t('kitchen.filters.actions.refresh')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
