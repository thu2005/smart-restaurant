import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import { createPortal } from "react-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import ModifierGroupModal from "./ModifierGroupModal";
import { toast } from "sonner";

const ModifierList = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      toast.error(t('admin.menu.items.modifiers.messages.loadError'));
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
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await menuService.deleteModifierGroup(deleteConfirm);
      toast.success(t('admin.menu.items.modifiers.messages.deleteSuccess'));
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error(t('admin.menu.items.modifiers.messages.deleteError'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
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

        // Handle options
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
              await menuService.updateModifierOption(opt.id, {
                name: opt.name,
                price_adjustment: opt.price_adjustment || 0,
              });
            } else {
              await menuService.createModifierOption(groupId, {
                name: opt.name,
                price_adjustment: opt.price_adjustment || 0,
              });
            }
          }
        }
        toast.success(t('admin.menu.items.modifiers.messages.saveSuccess'));
      } else {
        // Create new group
        const newGroup = await menuService.createModifierGroup({
          name: data.name,
          selection_type: data.selection_type,
          is_required: data.is_required,
          min_selections: data.min_selections,
          max_selections: data.max_selections,
          options: data.options || [],
        });
        groupId = newGroup.id;
        toast.success(t('admin.menu.items.modifiers.messages.createSuccess'));
      }

      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error(t('admin.menu.items.modifiers.messages.saveError'));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.menu.items.modifiers.titleList')}</h1>
          <p className="text-muted-foreground">
            {t('admin.menu.items.modifiers.subtitleList')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          {t('admin.menu.items.modifiers.addGroup')}
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
                    {t(`admin.menu.items.modifiers.modal.types.${group.selection_type}`) || group.selection_type}
                  </span>
                  {group.is_required && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">
                      {t('admin.menu.items.modifiers.card.required')}
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
                {t('admin.menu.items.modifiers.card.options')}
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
                        ? `+${formatCurrency(option.price_adjustment)}`
                        : t('admin.menu.items.modifiers.card.free')}
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
            {t('common.pagination.showing', { start: (page - 1) * limit + 1, end: Math.min(page * limit, total), total })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('common.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              {t('common.pagination.next')}
            </Button>
          </div>
        </div>
      )}

      <ModifierGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingGroup}
        title={editingGroup ? t('admin.menu.items.modifiers.modal.titleEdit') : t('admin.menu.items.modifiers.modal.titleNew')}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">{t('admin.menu.items.modifiers.delete.title')}</h3>
            <p className="text-gray-600 mb-6">
              {t('admin.menu.items.modifiers.delete.message')}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDelete}>
                {t('common.actions.cancel')}
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t('common.actions.delete')}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ModifierList;
