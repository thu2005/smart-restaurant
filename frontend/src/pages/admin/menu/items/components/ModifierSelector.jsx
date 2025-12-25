import React, { useState, useEffect } from "react";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import { toast } from "sonner";

const ModifierSelector = ({ itemId, attachedGroupIds = [], onUpdate }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set(attachedGroupIds));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await menuService.getModifierGroups();
        setAllGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load modifier groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set(attachedGroupIds));
  }, [attachedGroupIds]);

  const handleToggle = (groupId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await menuService.attachModifierGroupToItem(
        itemId,
        Array.from(selectedIds)
      );
      toast.success("Modifiers updated successfully");
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update modifiers");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading modifier groups...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attached Modifier Groups</h3>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allGroups.map((group) => (
          <div
            key={group.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedIds.has(group.id)
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleToggle(group.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-gray-500 capitalize">
                  {group.selection_type} Select
                </p>
              </div>
              <input
                type="checkbox"
                checked={selectedIds.has(group.id)}
                readOnly
                className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {group.options?.length || 0} options
            </div>
          </div>
        ))}
      </div>

      {allGroups.length === 0 && (
        <p className="text-gray-500">
          No modifier groups available. Create them in the Modifiers section.
        </p>
      )}
    </div>
  );
};

export default ModifierSelector;
