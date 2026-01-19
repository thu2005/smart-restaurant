import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import { toast } from "sonner";

const ModifierSelector = ({ itemId, attachedGroupIds = [], onUpdate }) => {
  const { t } = useTranslation();
  const [allGroups, setAllGroups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await menuService.getModifierGroups();
        setAllGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error(t('admin.menu.items.modifiers.messages.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    setSelectedIds(attachedGroupIds || []);
  }, [itemId, attachedGroupIds]);

  const isSelected = (groupId) => selectedIds.includes(groupId);

  const handleToggle = async (groupId) => {
    const previousSelected = [...selectedIds];
    let newSelected;

    if (isSelected(groupId)) {
      newSelected = selectedIds.filter((id) => id !== groupId);
    } else {
      newSelected = [...selectedIds, groupId];
    }

    setSelectedIds(newSelected);

    // Auto-save when toggling
    try {
      await menuService.attachModifierGroupToItem(itemId, newSelected);
      toast.success(t('admin.menu.items.modifiers.messages.updateSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('admin.menu.items.modifiers.messages.updateError'));
      setSelectedIds(previousSelected);
    }
  };

  if (loading) return <div>{t('common.messages.loading')}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">{t('admin.menu.items.modifiers.title')}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {t('admin.menu.items.modifiers.instruction')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allGroups.map((group) => (
          <div
            key={group.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${isSelected(group.id)
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-gray-200 hover:border-gray-300"
              }`}
            onClick={() => handleToggle(group.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-gray-500 capitalize">
                  {group.selection_type} {t('admin.menu.items.modifiers.select')}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isSelected(group.id)}
                onChange={() => { }}
                className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary pointer-events-none"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('admin.menu.items.modifiers.optionsCount', { count: group.options?.length || 0 })}
            </div>
          </div>
        ))}
      </div>

      {allGroups.length === 0 && (
        <p className="text-gray-500">
          {t('admin.menu.items.modifiers.empty')}
        </p>
      )}
    </div>
  );
};

export default ModifierSelector;
