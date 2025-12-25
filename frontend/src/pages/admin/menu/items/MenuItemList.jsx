import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import { toast } from "sonner";

const MenuItemList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at:desc");
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
        sort: sortBy,
        page,
        limit,
      };
      const data = await menuService.getItems(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error("Failed to load menu items");
      // Fallback data
      setItems([
        {
          id: "1",
          name: "Grilled Salmon",
          category_name: "Main Course",
          price: 24.99,
          status: "available",
          is_chef_recommended: true,
          created_at: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Caesar Salad",
          category_name: "Appetizers",
          price: 12.5,
          status: "available",
          is_chef_recommended: false,
          created_at: "2023-01-02T00:00:00Z",
        },
        {
          id: "3",
          name: "Tiramisu",
          category_name: "Desserts",
          price: 8.0,
          status: "sold_out",
          is_chef_recommended: true,
          created_at: "2023-01-03T00:00:00Z",
        },
      ]);
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
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await menuService.deleteItem(id);
        toast.success("Item deleted");
        fetchItems();
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
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
        <Button onClick={() => navigate("/admin/menu/items/new")}>
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
          <option value="created_at:desc">Newest First</option>
          <option value="created_at:asc">Oldest First</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
          <option value="popularity:desc">Most Popular</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Name</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Category</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Price</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Created Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Tags</th>
                <th className="px-6 py-3 font-medium text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {item.category_name || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "available"
                            ? "bg-green-100 text-green-800"
                            : item.status === "sold_out"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.is_chef_recommended && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Chef's Choice
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/menu/items/${item.id}`)}
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
    </div>
  );
};

export default MenuItemList;
