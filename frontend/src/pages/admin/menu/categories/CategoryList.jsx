import React, { useState, useEffect } from "react";
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await menuService.getCategories();

      let sortedData = Array.isArray(data) ? [...data] : [];

      sortedData.sort((a, b) => {
        if (sortBy === "display_order") {
          return a.display_order - b.display_order;
        } else if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortBy === "created_at") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0); // Newest first
        }
        return 0;
      });

      setCategories(sortedData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
      // Fallback for demo if API fails
      setCategories([
        {
          id: "1",
          name: "Appetizers",
          description: "Starters",
          display_order: 1,
          status: "active",
          items_count: 5,
          created_at: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Main Course",
          description: "Main dishes",
          display_order: 2,
          status: "active",
          items_count: 12,
          created_at: "2023-01-02T00:00:00Z",
        },
        {
          id: "3",
          name: "Desserts",
          description: "Sweet treats",
          display_order: 3,
          status: "inactive",
          items_count: 3,
          created_at: "2023-01-03T00:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [sortBy]);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // Note: In a real app, we might check if it has items first or handle soft delete
        // The assignment says "Soft delete or mark as inactive"
        await menuService.updateCategoryStatus(id, "inactive");
        toast.success("Category deactivated");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
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

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 font-medium hidden xl:table-cell">
                  Created Date
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">
                      {category.display_order}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-4 py-4 text-gray-500 truncate max-w-xs hidden lg:table-cell">
                      {category.description || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-500 hidden xl:table-cell">
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500">
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        title={editingCategory ? "Edit Category" : "New Category"}
      />
    </div>
  );
};

export default CategoryList;
