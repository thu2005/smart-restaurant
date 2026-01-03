import React, { useState, useEffect } from "react";
import menuService from "services/menuService";
import CategoryFilter from "./components/CategoryFilter";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import MenuItemCard from "./components/MenuItemCard";
import FloatingCartButton from "./components/FloatingCartButton";
import EmptyState from "./components/EmptyState";
import Button from "../../../components/ui/Button";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5001";

const MenuBrowse = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: "all",
    dietary: [],
    availability: ["available", "low-stock"],
  });

  const [categories, setCategories] = useState([
    { value: "all", label: "All Items", icon: "UtensilsCrossed", count: 0 },
  ]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get restaurantId from localStorage or use default
        const restaurantId =
          localStorage.getItem("restaurantId") || "default-restaurant-id";

        const [catsResponse, itemsResponse] = await Promise.all([
          menuService.getCategories({
            limit: 50, // Get all categories without pagination for filter
          }),
          menuService.getItems({
            restaurantId,
            categoryId: activeCategory === "all" ? undefined : activeCategory,
            search: searchQuery || undefined,
            status: "available", // Only show available items for customers
            page: 1,
            limit: 100, // Get more items per page for customer browsing
          }),
        ]);

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
            label: "All Items",
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
        setCategories(formattedCats);

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
                  item.photos.find((p) => p.is_primary) || item.photos[0];
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
                rating: 4.5, // Mock rating for now
                reviewCount: Math.floor(Math.random() * 50) + 5, // Mock count
                prepTime: item.prep_time_minutes || 15,
                availability: item.status,
                isPopular: Math.random() > 0.7, // Random popular items
                isChefRecommended: item.is_chef_recommended || false,
                dietary: [], // TODO: Add dietary info from backend
              };
            })
          : [];

        setMenuItems(formattedItems);
      } catch (error) {
        console.error("Failed to load menu:", error);
        // Set empty state on error
        setCategories([
          {
            value: "all",
            label: "All Items",
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
  }, [activeCategory, searchQuery]); // Re-fetch when category or search changes

  // Filter logic (client-side for now for other filters)
  const filteredItems = menuItems.filter((item) => {
    // Category and Search are handled by API in this implementation,
    // but if we want client side filtering for other things:

    // Price Range
    if (filters.priceRange !== "all") {
      if (filters.priceRange === "under-15" && item.price >= 15) return false;
      if (
        filters.priceRange === "15-30" &&
        (item.price < 15 || item.price > 30)
      )
        return false;
      if (filters.priceRange === "over-30" && item.price <= 30) return false;
    }

    // Dietary
    if (
      filters.dietary.length > 0 &&
      !filters.dietary.every((d) => item.dietary?.includes(d))
    ) {
      return false;
    }

    return true;
  });

  const handleQuickAdd = (item) => {
    const existingItem = cartItems?.find(
      (cartItem) => cartItem?.id === item?.id
    );
    if (existingItem) {
      setCartItems(
        cartItems?.map((cartItem) =>
          cartItem?.id === item?.id
            ? { ...cartItem, quantity: cartItem?.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: "all",
      dietary: [],
      availability: ["available", "low-stock"],
    });
    setSearchQuery("");
    setActiveCategory("all");
  };

  const cartItemCount = cartItems?.reduce(
    (sum, item) => sum + item?.quantity,
    0
  );
  const cartTotal = cartItems?.reduce(
    (sum, item) => sum + item?.price * item?.quantity,
    0
  );

  const activeFiltersCount =
    (filters?.priceRange !== "all" ? 1 : 0) +
    filters?.dietary?.length +
    (filters?.availability?.length !== 2 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 pb-24 lg:pb-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-2">
            Browse Our Menu
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Discover delicious dishes crafted with fresh ingredients
          </p>
        </div>

        <div className="mb-6 md:mb-8">
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
              placeholder="Search for dishes, ingredients..."
            />
          </div>
          <Button
            variant="outline"
            iconName="SlidersHorizontal"
            iconPosition="left"
            onClick={() => setIsFilterOpen(true)}
            className="w-full md:w-auto"
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {filteredItems?.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm md:text-base text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredItems?.length}
                </span>{" "}
                items
              </p>
              {(searchQuery || activeFiltersCount > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  iconPosition="left"
                  onClick={handleResetFilters}
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredItems?.map((item) => (
                <MenuItemCard
                  key={item?.id}
                  item={item}
                  onQuickAdd={handleQuickAdd}
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

      <FloatingCartButton itemCount={cartItemCount} totalAmount={cartTotal} />
    </div>
  );
};

export default MenuBrowse;
