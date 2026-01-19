import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Fuse from "fuse.js";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import menuService from "services/menuService";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import Icon from "components/AppIcon";
import { toast } from "sonner";
import { useCurrency } from "../../../../contexts/CurrencyContext";
import MenuItemModal from "./MenuItemModal";

const MenuItemList = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
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
      const result = await menuService.getItems(params);

      // Handle both paginated and non-paginated responses
      if (result.data && result.pagination) {
        setItems(result.data || []);
      } else {
        setItems(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
      // Check if it's because of missing restaurant
      if (error.response?.data?.message?.includes("No restaurant assigned")) {
        setNoRestaurant(true);
        setNoRestaurant(true);
        toast.error(t('admin.menu.items.messages.noRestaurant'));
      } else {
        toast.error(t('admin.menu.items.messages.loadError'));
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

  useEffect(() => {
    if (!search) {
      setFilteredItems(items);
      return;
    }
    // Prefix search (case-insensitive)
    const prefixMatches = items.filter(
      (item) =>
        item.name?.toLowerCase().startsWith(search.toLowerCase()) ||
        item.category_name?.toLowerCase().startsWith(search.toLowerCase())
    );

    if (prefixMatches.length > 0) {
      setFilteredItems(prefixMatches);
    } else {
      // Fuzzy search fallback
      const fuse = new Fuse(items, {
        keys: [
          { name: "name", weight: 0.8 },
          { name: "category_name", weight: 0.2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      });
      const result = fuse.search(search);
      setFilteredItems(result.map((r) => r.item));
    }
  }, [search, items]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on search
    // No need to fetchItems here, fuzzy search is client-side
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await menuService.deleteItem(deleteConfirm);
      toast.success(t('admin.menu.items.messages.deleteSuccess'));
      fetchItems();
    } catch (error) {
      toast.error(t('admin.menu.items.messages.deleteError'));
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'low_stock': return t('admin.menu.items.status.lowStock');
      case 'sold_out': return t('admin.menu.items.status.soldOut');
      default: return t(`admin.menu.items.status.${status}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.menu.items.title')}</h1>
          <p className="text-muted-foreground">
            {t('admin.menu.items.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          {t('admin.menu.items.addItem')}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder={t('admin.menu.items.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            {t('common.actions.search')}
          </Button>
        </form>

        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">{t('admin.menu.items.filters.allCategories')}</option>
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
          <option value="">{t('admin.menu.items.filters.allStatuses')}</option>
          <option value="available">{t('admin.menu.items.status.available')}</option>
          <option value="low_stock">{t('admin.menu.items.status.lowStock')}</option>
          <option value="sold_out">{t('admin.menu.items.status.soldOut')}</option>
          <option value="unavailable">{t('admin.menu.items.status.unavailable')}</option>
        </select>

        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt">{t('admin.menu.items.filters.newest')}</option>
          <option value="name">{t('admin.menu.items.sort.nameAz')}</option>
          <option value="price">{t('admin.menu.items.filters.priceLowHigh')}</option>
          <option value="price_desc">{t('admin.menu.items.filters.priceHighLow')}</option>
          <option value="popularity">{t('admin.menu.items.filters.popularity')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {t('admin.menu.items.table.name')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {t('admin.menu.items.table.category')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {t('admin.menu.items.table.price')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                  {t('admin.menu.items.table.createdDate')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {t('admin.menu.items.table.status')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  {t('admin.menu.items.table.tags')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right whitespace-nowrap">
                  {t('admin.menu.items.table.actions')}
                </th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    {noRestaurant ? (
                      <div className="flex flex-col items-center gap-3">
                        <Icon
                          name="alert-circle"
                          className="w-12 h-12 text-amber-500"
                        />
                        <div>
                          <p className="text-gray-700 font-medium mb-1">
                            {t('admin.menu.items.empty.noRestaurantTitle')}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {t('admin.menu.items.empty.noRestaurantDesc')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">{t('admin.menu.items.empty.noItems')}</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td
                      className="px-4 py-4 font-medium text-foreground whitespace-nowrap max-w-[150px] sm:max-w-[200px] truncate"
                      title={item.name}
                    >
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                      {item.category_name || "-"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(Number(item.price))}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap hidden xl:table-cell">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "available"
                          ? "bg-green-100 text-green-800"
                          : item.status === "low_stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "sold_out"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      {item.is_chef_recommended && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {t('admin.menu.items.badges.chefChoice')}
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
        <div className="text-sm text-gray-500">{t('common.pagination.showingPage')} {page}</div>
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
            disabled={items.length < limit}
          >
            {t('common.pagination.next')}
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
      {
        deleteConfirm &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">{t('admin.menu.items.deleteConfirm')}</h3>
              <p className="text-gray-600 mb-6">
                {t('admin.menu.items.deleteMessage')}
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
        )
      }
    </div >
  );
};

export default MenuItemList;
