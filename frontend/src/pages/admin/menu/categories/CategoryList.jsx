import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import CategoryModal from "./CategoryModal";
import { toast } from "sonner";

const CategoryList = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [sortBy, setSortBy] = useState("display_order"); // display_order, name, created_at
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await menuService.getCategories({ page, limit, sortBy });

      // Backend now returns { data, pagination } if pagination params are provided
      if (result.pagination) {
        setCategories(result.data || []);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } else {
        // Fallback for old API response format
        const data = result.data || result;
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error(t('admin.menu.categories.messages.loadError'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [sortBy, page, limit]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      // Note: In a real app, we might check if it has items first or handle soft delete
      // The assignment says "Soft delete or mark as inactive"
      await menuService.updateCategoryStatus(deleteConfirm, "inactive");
      toast.success(t('admin.menu.categories.messages.deleteSuccess'));
      fetchCategories();
    } catch (error) {
      toast.error(t('admin.menu.categories.messages.deleteError'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, data);
        toast.success(t('admin.menu.categories.messages.updateSuccess'));
      } else {
        await menuService.createCategory(data);
        toast.success(t('admin.menu.categories.messages.createSuccess'));
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(t('admin.menu.categories.messages.updateError'));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.menu.categories.title')}</h1>
          <p className="text-muted-foreground">
            {t('admin.menu.categories.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          {t('admin.menu.categories.addCategory')}
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('admin.menu.items.filters.sortBy')}:</span>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="display_order">{t('admin.menu.categories.sort.displayOrder')}</option>
            <option value="name">{t('admin.menu.categories.sort.name')}</option>
            <option value="created_at">{t('admin.menu.categories.sort.createdDate')}</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.menu.categories.table.order')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.menu.categories.table.name')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  {t('admin.menu.categories.table.description')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                  {t('admin.menu.categories.table.createdDate')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.menu.categories.table.status')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.menu.categories.table.items')}</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">{t('admin.menu.categories.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    {t('common.messages.loading')}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    {t('admin.menu.categories.empty')}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium">
                      {category.display_order}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground truncate max-w-xs hidden lg:table-cell">
                      {category.description || "-"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground hidden xl:table-cell">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {t(`common.status.${category.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {category.items_count || 0}
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Icon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Icon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {t('common.pagination.showingPage')} {page} {t('common.pagination.of')} {totalPages}
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
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        title={editingCategory ? t('admin.menu.categories.modal.editTitle') : t('admin.menu.categories.modal.newTitle')}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">{t('admin.menu.categories.deleteConfirm')}</h3>
            <p className="text-gray-600 mb-6">
              {t('admin.menu.categories.deleteMessage')}
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

export default CategoryList;
