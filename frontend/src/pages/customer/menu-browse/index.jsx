import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import menuService, { getRestaurantId } from "services/menuService";
import { useCart } from "../../../contexts/CartContext";
import { fuzzySearchMenuItems } from "../../../utils/fuzzySearch";
import { useMenuBrowseState } from "../../../hooks/useMenuBrowseState";
import CategoryFilter from "./components/CategoryFilter";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import MenuItemCard from "./components/MenuItemCard";
import FloatingCartButton from "./components/FloatingCartButton";
import EmptyState from "./components/EmptyState";
import Button from "../../../components/ui/Button";
import LucideIcon from "../../../components/ui/LucideIcon";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const MenuBrowse = () => {
  const { t } = useTranslation();
  const { restaurantId: paramRestaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartSummary } = useCart();
  const {
    saveMenuState,
    restoreMenuState,
    hasSavedState,
    clearScrollPosition,
  } = useMenuBrowseState();

  // Initialize state with saved values if available
  const initializeState = () => {
    if (hasSavedState()) {
      const savedState = restoreMenuState();
      if (savedState) {
        return {
          activeCategory: savedState.activeCategory || "all",
          searchQuery: savedState.searchQuery || "",
          filters: savedState.filters || {
            sortBy: "createdAt",
            isChefRecommended: false,
            isPopular: false,
            dietary: [],
            availability: ["available"],
          },
        };
      }
    }

    return {
      activeCategory: "all",
      searchQuery: "",
      filters: {
        sortBy: "createdAt",
        isChefRecommended: false,
        isPopular: false,
        dietary: [],
        availability: ["available"],
      },
    };
  };

  const initialState = initializeState();

  const [activeCategory, setActiveCategory] = useState(
    initialState.activeCategory,
  );
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(initialState.filters);

  const [categories, setCategories] = useState([
    {
      value: "all",
      label: t("customer.menu.categories.all"),
      icon: "UtensilsCrossed",
      count: 0,
    },
  ]);
  const [allMenuItems, setAllMenuItems] = useState([]); // Store all items for fuzzy search
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get restaurantId from URL params, localStorage, or user data
        let restaurantId =
          paramRestaurantId || localStorage.getItem("restaurantId");

        // If still no restaurantId, try to get from logged-in user
        if (!restaurantId) {
          try {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            restaurantId = userData.restaurantId;
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        // Last resort - use getRestaurantId helper which has fallback logic
        if (!restaurantId) {
          restaurantId = getRestaurantId();
        }

        console.log("Using restaurantId:", restaurantId);
        console.log("Fetching with filters:", filters);

        const [catsResponse, itemsResponse] = await Promise.all([
          menuService.getCategories({
            limit: 50, // Get all categories without pagination for filter
          }),
          menuService.getItems({
            restaurantId,
            // Don't send search query - we'll do fuzzy search locally
            // Don't filter by category - we'll filter locally
            status:
              filters.availability?.length === 1
                ? filters.availability[0]
                : undefined, // Only send status when single option selected
            isChefRecommended: filters.isChefRecommended || undefined,
            isPopular: filters.isPopular || undefined,
            sortBy: filters.sortBy || "createdAt",
            page: 1,
            limit: 100, // Get more items per page for customer browsing
          }),
        ]);

        console.log("API Response items:", itemsResponse);

        // Handle categories - check if paginated response or direct array
        let catsData = [];
        if (catsResponse && typeof catsResponse === "object") {
          catsData = catsResponse.data || catsResponse;
        }
        if (Array.isArray(catsResponse)) {
          catsData = catsResponse;
        }

        // Handle items - get from paginated response
        let itemsData = [];
        if (itemsResponse && typeof itemsResponse === "object") {
          itemsData = itemsResponse.data || itemsResponse;
        }
        if (Array.isArray(itemsResponse)) {
          itemsData = itemsResponse;
        }

        // Transform categories for UI
        const formattedCats = [
          {
            value: "all",
            label: t("customer.menu.categories.all"),
            icon: "UtensilsCrossed",
            count: Array.isArray(itemsData) ? itemsData.length : 0,
          },
          ...(Array.isArray(catsData)
            ? catsData
                .filter((c) => c.status === "active") // Only show active categories
                .map((c) => ({
                  value: c.id,
                  label: c.name,
                  icon: "UtensilsCrossed",
                  count: c.items_count || 0,
                }))
            : []),
        ];

        // Helper to get icon by category name
        const getCategoryIcon = (categoryName) => {
          const name = categoryName?.toLowerCase() || "";
          if (name.includes("appetizer") || name.includes("starter"))
            return "Utensils";
          if (name.includes("soup") || name.includes("salad")) return "Soup";
          if (
            name.includes("main") ||
            name.includes("meat") ||
            name.includes("beef") ||
            name.includes("steak") ||
            name.includes("chicken")
          )
            return "ChefHat";
          if (
            name.includes("seafood") ||
            name.includes("fish") ||
            name.includes("shrimp")
          )
            return "Fish";
          if (
            name.includes("drink") ||
            name.includes("beverage") ||
            name.includes("tea") ||
            name.includes("coffee")
          )
            return "Coffee";
          if (
            name.includes("dessert") ||
            name.includes("cake") ||
            name.includes("sweet") ||
            name.includes("ice cream")
          )
            return "IceCream";
          if (name.includes("breakfast")) return "Croissant";
          if (name.includes("pizza")) return "Pizza";
          if (name.includes("burger") || name.includes("sandwich"))
            return "Sandwich";
          if (name.includes("pasta") || name.includes("noodle"))
            return "UtensilsCrossed";
          return "Menu"; // Default
        };

        const updatedCats = formattedCats.map((cat) => ({
          ...cat,
          icon: cat.value === "all" ? "LayoutGrid" : getCategoryIcon(cat.label),
        }));

        setCategories(updatedCats);

        // Transform items for UI
        const formattedItems = Array.isArray(itemsData)
          ? itemsData.map((item) => {
              // Handle image URL properly
              let imageUrl =
                "https://via.placeholder.com/300x200?text=No+Image";

              if (
                item.photos &&
                Array.isArray(item.photos) &&
                item.photos.length > 0
              ) {
                const primaryPhoto =
                  item.photos.find((p) => p.isPrimary) || item.photos?.[0];
                if (primaryPhoto && primaryPhoto.url) {
                  imageUrl = primaryPhoto.url.startsWith("http")
                    ? primaryPhoto.url
                    : `${BASE_URL}${primaryPhoto.url}`;
                }
              } else if (item.image) {
                imageUrl = item.image.startsWith("http")
                  ? item.image
                  : `${BASE_URL}${item.image}`;
              }

              return {
                id: item.id,
                name: item.name,
                description:
                  item.description ||
                  "Delicious dish made with fresh ingredients",
                price: Number(item.price),
                image: imageUrl,
                imageAlt: item.name,
                category: item.category_id,
                rating: item.averageRating || 0,
                reviewCount: item.reviewCount || 0,
                prepTime: item.prep_time_minutes || 15,
                availability: item.status,
                isPopular: item.is_popular || false,
                isChefRecommended: item.is_chef_recommended || false,
                dietary: item.dietary || [],
              };
            })
          : [];

        setAllMenuItems(formattedItems); // Store all items for filtering
        setMenuItems(formattedItems);
      } catch (error) {
        console.error("Failed to load menu:", error);
        // Set empty state on error
        setCategories([
          {
            value: "all",
            label: t("customer.menu.categories.all"),
            icon: "UtensilsCrossed",
            count: 0,
          },
        ]);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    // Remove searchQuery from dependencies since we'll filter locally
    activeCategory,
    filters.isChefRecommended,
    filters.isPopular,
    filters.availability,
    filters.sortBy,
  ]); // Re-fetch when criteria changes (except search)

  // Save state whenever it changes
  useEffect(() => {
    saveMenuState({
      activeCategory,
      searchQuery,
      filters,
    });
  }, [activeCategory, searchQuery, filters, saveMenuState]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (menuItems && menuItems.length > 0 && hasSavedState()) {
      const savedState = restoreMenuState();
      if (savedState && savedState.scrollPosition) {
        const timer = setTimeout(() => {
          window.scrollTo({
            top: savedState.scrollPosition,
            behavior: "auto",
          });
          // Clear scroll position after restoring to avoid repeated restores
          clearScrollPosition();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [menuItems, hasSavedState, restoreMenuState, clearScrollPosition]);

  // Handle menu item click with state saving
  const handleMenuItemClick = (menuItem) => {
    const currentScrollPosition = window.scrollY;

    // Save current state with scroll position
    saveMenuState({
      activeCategory,
      searchQuery,
      filters,
      scrollPosition: currentScrollPosition,
    });

    // Navigate to item detail using the correct route format
    navigate(`/customer/menu-item-detail/${menuItem.id}`);
  };

  // Apply fuzzy search and filters locally
  const filteredItems = useMemo(() => {
    let items = [...allMenuItems];

    // 1. Apply fuzzy search first
    if (searchQuery && searchQuery.trim() !== "") {
      items = fuzzySearchMenuItems(items, searchQuery);
    }

    // 2. Filter by category
    if (activeCategory !== "all") {
      items = items.filter((item) => item.category === activeCategory);
    }

    // 3. Apply dietary filters
    if (filters.dietary.length > 0) {
      items = items.filter((item) =>
        filters.dietary.every((d) => item.dietary?.includes(d)),
      );
    }

    return items;
  }, [allMenuItems, searchQuery, activeCategory, filters.dietary]);

  const handleQuickAdd = (item) => {
    // Add item to cart with quantity 1 (no modifiers for quick add)
    addToCart({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      modifiers: [], // Quick add = no modifiers
      specialInstructions: "",
      prepTime: item.prepTime || 15,
    });

    // Optional: Show toast notification
    console.log(`Added ${item.name} to cart`);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      sortBy: "createdAt",
      isChefRecommended: false,
      isPopular: false,
      dietary: [],
      availability: ["available"],
    });
    setSearchQuery("");
    setActiveCategory("all");
  };

  const getActiveFilterTags = () => {
    const tags = [];
    const allSortOptions = [
      { value: "createdAt", label: t("customer.menu.sort.newest") },
      { value: "price", label: t("customer.menu.sort.priceLowHigh") },
      { value: "price_desc", label: t("customer.menu.sort.priceHighLow") },
      { value: "name", label: t("customer.menu.sort.nameAZ") },
      { value: "orderCount", label: t("customer.menu.sort.mostOrdered") },
    ];

    // Special filters
    if (filters.isPopular) {
      tags.push({
        id: "isPopular",
        label: t("customer.menu.categories.popular"),
        color: "blue",
        onRemove: () => handleFilterChange("isPopular", false),
      });
    }
    if (filters.isChefRecommended) {
      tags.push({
        id: "isChefRecommended",
        label: t("customer.menu.filters.chefRecommended"),
        color: "purple",
        onRemove: () => handleFilterChange("isChefRecommended", false),
      });
    }

    // Dietary filters
    if (filters.dietary?.length > 0) {
      filters.dietary.forEach((diet) => {
        tags.push({
          id: `dietary-${diet}`,
          label: t(
            `customer.menu.dietary.${diet}`,
            diet.charAt(0).toUpperCase() + diet.slice(1),
          ),
          color: "green",
          onRemove: () => {
            const newDietary = filters.dietary.filter((d) => d !== diet);
            handleFilterChange("dietary", newDietary);
          },
        });
      });
    }

    // Availability filter
    if (filters.availability?.[0] && filters.availability[0] !== "available") {
      const availabilityLabels = {
        low_stock: t("customer.menu.item.lowStock"),
        sold_out: t("customer.menu.item.soldOut"),
        unavailable: t("customer.menu.item.unavailable"),
      };
      tags.push({
        id: "availability",
        label:
          availabilityLabels[filters.availability[0]] ||
          filters.availability[0],
        color: "orange",
        onRemove: () => handleFilterChange("availability", ["available"]),
      });
    }

    // Sort filter
    const sortLabel = allSortOptions.find(
      (opt) => opt.value === filters.sortBy,
    )?.label;
    if (sortLabel && filters.sortBy !== "createdAt") {
      tags.push({
        id: "sortBy",
        label: `${t("customer.menu.sort.label")}: ${sortLabel}`,
        color: "gray",
        onRemove: () => handleFilterChange("sortBy", "createdAt"),
      });
    }

    return tags;
  };

  const { itemCount, subtotal } = getCartSummary();

  const activeFiltersCount =
    (filters?.sortBy !== "createdAt" ? 1 : 0) +
    (filters?.isChefRecommended ? 1 : 0) +
    (filters?.isPopular ? 1 : 0) +
    (filters?.dietary?.length || 0) +
    (filters?.availability?.[0] !== "available" ? 1 : 0);

  const activeFilterTags = getActiveFilterTags();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-24 lg:pb-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
            {t("customer.menu.title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("customer.menu.subtitle")}
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchQuery}
              value={searchQuery}
              placeholder={t("customer.menu.search.placeholder")}
            />
          </div>
          <Button
            variant="outline"
            iconName="SlidersHorizontal"
            iconPosition="left"
            onClick={() => setIsFilterOpen(true)}
            className="w-full md:w-auto"
          >
            {t("customer.menu.filters.title")}
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {activeFilterTags.length > 0 && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-muted-foreground">
              {t("customer.menu.activeFilters")}
            </p>
            {activeFilterTags.map((tag) => {
              const colorClasses = {
                blue: "bg-blue-100 text-blue-700 border-blue-200",
                purple: "bg-purple-100 text-purple-700 border-purple-200",
                green: "bg-green-100 text-green-700 border-green-200",
                orange: "bg-orange-100 text-orange-700 border-orange-200",
                gray: "bg-gray-100 text-gray-700 border-gray-200",
              };
              return (
                <div
                  key={tag.id}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${
                    colorClasses[tag.color] || colorClasses.gray
                  }`}
                >
                  <span>{tag.label}</span>
                  <button
                    onClick={tag.onRemove}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <LucideIcon name="X" size={12} />
                  </button>
                </div>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={handleResetFilters}
            >
              {t("customer.menu.filters.reset", "Clear all")}
            </Button>
          </div>
        )}

        {filteredItems?.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-sm md:text-base text-muted-foreground">
                {t("customer.menu.showingItems", {
                  count: filteredItems?.length,
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredItems?.map((item) => (
                <MenuItemCard
                  key={item?.id}
                  item={item}
                  onQuickAdd={handleQuickAdd}
                  onItemClick={handleMenuItemClick}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState searchQuery={searchQuery} onReset={handleResetFilters} />
        )}
      </main>
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={() => {}}
        onResetFilters={handleResetFilters}
      />

      <FloatingCartButton itemCount={itemCount} totalAmount={subtotal} />
    </div>
  );
};

export default MenuBrowse;
