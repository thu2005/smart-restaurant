import React, { useState, useEffect } from "react";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import ModifierGroupModal from "./ModifierGroupModal";
import { toast } from "sonner";

const ModifierList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const result = await menuService.getModifierGroups({ page, limit });

      // Backend now returns { data, pagination } if pagination params are provided
      if (result.pagination) {
        setGroups(result.data || []);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } else {
        // Fallback for old API response format
        const data = result.data || result;
        setGroups(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch modifier groups:", error);
      toast.error("Failed to load modifier groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [page, limit]);

  const handleCreate = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this modifier group? This will also remove it from all menu items."
      )
    ) {
      try {
        await menuService.deleteModifierGroup(id);
        toast.success("Modifier group deleted");
        fetchGroups();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete modifier group");
      }
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      let groupId;
      if (editingGroup) {
        // Update existing group
        await menuService.updateModifierGroup(editingGroup.id, {
          name: data.name,
          selection_type: data.selection_type,
          is_required: data.is_required,
          min_selections: data.min_selections,
          max_selections: data.max_selections,
        });
        groupId = editingGroup.id;

        // Handle options for existing group
        // Delete all existing options and recreate (simpler approach)
        // In production, you'd want to do proper diff/patch
        const existingOptions = editingGroup.options || [];

        // Delete removed options
        for (const existingOpt of existingOptions) {
          const stillExists = data.options?.find(
            (opt) => opt.id === existingOpt.id
          );
          if (!stillExists && existingOpt.id) {
            try {
              await menuService.deleteModifierOption?.(existingOpt.id);
            } catch (err) {
              console.warn("Failed to delete option:", err);
            }
          }
        }

        // Create or update options
        if (data.options && data.options.length > 0) {
          for (const opt of data.options) {
            if (opt.id) {
              // Update existing option
              await menuService.updateModifierOption(opt.id, {
                name: opt.name,
                price_adjustment: opt.price_adjustment || 0,
              });
            } else {
              // Create new option
              await menuService.createModifierOption(groupId, {
                name: opt.name,
                price_adjustment: opt.price_adjustment || 0,
              });
            }
          }
        }

        toast.success("Modifier group updated");
      } else {
        // Create new group with options
        const newGroup = await menuService.createModifierGroup({
          name: data.name,
          selection_type: data.selection_type,
          is_required: data.is_required,
          min_selections: data.min_selections,
          max_selections: data.max_selections,
          options: data.options || [],
        });
        groupId = newGroup.id;
        toast.success("Modifier group created");
      }

      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save modifier group");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modifier Groups</h1>
          <p className="text-muted-foreground">
            Manage customization options for your menu items.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-lg border shadow-sm p-4 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 capitalize">
                    {group.selection_type}
                  </span>
                  {group.is_required && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(group)}
                >
                  <Icon name="Edit" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(group.id)}
                >
                  <Icon name="Trash2" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                Options
              </p>
              <ul className="space-y-2">
                {group.options?.map((option) => (
                  <li
                    key={option.id || option.name}
                    className="flex justify-between text-sm"
                  >
                    <span>{option.name}</span>
                    <span className="text-gray-500">
                      {option.price_adjustment > 0
                        ? `+$${option.price_adjustment.toFixed(2)}`
                        : "Free"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} groups
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ModifierGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingGroup}
        title={editingGroup ? "Edit Modifier Group" : "New Modifier Group"}
      />
    </div>
  );
};

export default ModifierList;
