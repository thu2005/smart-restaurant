import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Icon from "components/AppIcon";
import CategoryModal from "./CategoryModal";
import { toast } from "sonner";

const CategoryList = () => {
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
      toast.error("Failed to load categories");
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
      toast.success("Category deactivated");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
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
        toast.success("Category updated successfully");
      } else {
        await menuService.createCategory(data);
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save category");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Categories</h1>
          <p className="text-muted-foreground">
            Manage your menu categories and their display order.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="display_order">Display Order</option>
            <option value="name">Name</option>
            <option value="created_at">Creation Date</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                  Created Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No categories found.
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
                        {category.status}
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
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} categories
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
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        title={editingCategory ? "Edit Category" : "New Category"}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Delete category?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? This will deactivate the category. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
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
