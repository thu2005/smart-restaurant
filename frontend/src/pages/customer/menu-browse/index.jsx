import React, { useState, useEffect } from "react";
import menuService from "services/menuService";
import CustomerOrderProgress from "../../../components/navigation/CustomerOrderProgress";
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
        const [catsData, itemsData] = await Promise.all([
          menuService.getCategories(),
          menuService.getGuestMenu({
            categoryId: activeCategory === "all" ? undefined : activeCategory,
            q: searchQuery,
          }),
        ]);

        // Transform categories for UI
        const formattedCats = [
          {
            value: "all",
            label: "All Items",
            icon: "UtensilsCrossed",
            count: itemsData.length,
          }, // Count might be inaccurate if paginated
          ...(Array.isArray(catsData)
            ? catsData.map((c) => ({
                value: c.id,
                label: c.name,
                icon: "UtensilsCrossed", // Default icon
                count: c.items_count || 0,
              }))
            : []),
        ];
        setCategories(formattedCats);

        // Transform items for UI if needed
        // Assuming backend returns compatible structure or we map it
        const formattedItems = Array.isArray(itemsData)
          ? itemsData.map((item) => {
              const photoUrl = item.primary_photo_url || item.photos?.[0]?.url;
              return {
                id: item.id,
                name: item.name,
                description: item.description,
                price: Number(item.price),
                image: photoUrl
                  ? `${BASE_URL}${photoUrl}`
                  : "https://via.placeholder.com/150",
                imageAlt: item.name,
                category: item.category_id,
                rating: 4.5, // Mock rating
                reviewCount: 10, // Mock count
                prepTime: item.prep_time_minutes,
                availability: item.status,
                isPopular: false, // Mock
                isChefRecommended: item.is_chef_recommended,
                dietary: [], // Mock
              };
            })
          : [];

        setMenuItems(formattedItems);
      } catch (error) {
        console.error("Failed to load menu", error);
        // Fallback to empty or error state
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
      <CustomerOrderProgress />
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
