import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import { toast } from "sonner";
import MenuItemModal from "./MenuItemModal";

const MenuItemList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noRestaurant, setNoRestaurant] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchCategories = async () => {
    try {
      const data = await menuService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        categoryId: selectedCategory,
        status: statusFilter,
        sortBy: sortBy,
        page,
        limit,
      };
      const data = await menuService.getItems(params);
      setItems(Array.isArray(data) ? data : []);
      setNoRestaurant(false);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      // Check if it's because of missing restaurant
      if (error.response?.data?.message?.includes("No restaurant assigned")) {
        setNoRestaurant(true);
        toast.error("No restaurant assigned to your account");
      } else {
        toast.error("Failed to load menu items");
      }
      // Fallback data
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, statusFilter, sortBy, page, limit]); // Trigger fetch on filter change

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on search
    fetchItems();
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await menuService.deleteItem(deleteConfirm);
      toast.success("Item deleted");
      fetchItems();
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleCreate = () => {
    setEditingItemId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    setEditingItemId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItemId(null);
  };

  const handleModalSave = () => {
    fetchItems();
    // We don't close modal here because MenuItemModal might keep it open for photos
    // But if it was a simple save, we might want to refresh.
    // MenuItemModal calls onSave() after create/update.
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground">
            Manage your restaurant's menu items.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="sold_out">Sold Out</option>
        </select>

        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">Newest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="price">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popularity">Most Popular</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Category
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Price
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap hidden xl:table-cell">
                  Created Date
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap hidden lg:table-cell">
                  Tags
                </th>
                <th className="px-4 py-3 font-medium text-right whitespace-nowrap">
                  Actions
                </th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center"
                  >
                    {noRestaurant ? (
                      <div className="flex flex-col items-center gap-3">
                        <Icon name="alert-circle" className="w-12 h-12 text-amber-500" />
                        <div>
                          <p className="text-gray-700 font-medium mb-1">No Restaurant Assigned</p>
                          <p className="text-gray-500 text-sm">
                            Your account doesn't have a restaurant assigned yet. 
                            Please contact the administrator to set up your restaurant.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No items found.</p>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap max-w-[150px] sm:max-w-[200px] truncate"
                      title={item.name}
                    >
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                      {item.category_name || "-"}
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-nowrap">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap hidden xl:table-cell">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "available"
                            ? "bg-green-100 text-green-800"
                            : item.status === "sold_out"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      {item.is_chef_recommended && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Chef's Choice
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Icon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(item.id)}
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Showing page {page}</div>
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
            disabled={items.length < limit}
          >
            Next
          </Button>
        </div>
      </div>

      <MenuItemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        itemId={editingItemId}
        onSave={handleModalSave}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Delete menu item?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this menu item? This action cannot be undone.
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

export default MenuItemList;
