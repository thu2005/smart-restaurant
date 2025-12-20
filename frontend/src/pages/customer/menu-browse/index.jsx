import React, { useState, useEffect } from "react";
import CustomerOrderProgress from "../../../components/navigation/CustomerOrderProgress";
import CategoryFilter from "./components/CategoryFilter";
import SearchBar from "./components/SearchBar";
import FilterPanel from "./components/FilterPanel";
import MenuItemCard from "./components/MenuItemCard";
import FloatingCartButton from "./components/FloatingCartButton";
import EmptyState from "./components/EmptyState";
import Button from "../../../components/ui/Button";

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

  const categories = [
    { value: "all", label: "All Items", icon: "UtensilsCrossed", count: 24 },
    { value: "appetizers", label: "Appetizers", icon: "Salad", count: 8 },
    { value: "main", label: "Main Course", icon: "ChefHat", count: 12 },
    { value: "drinks", label: "Drinks", icon: "Coffee", count: 4 },
  ];

  const menuItems = [
    {
      id: 1,
      name: "Grilled Salmon with Herbs",
      description:
        "Fresh Atlantic salmon grilled to perfection with aromatic herbs, served with seasonal vegetables and lemon butter sauce",
      price: 24.99,
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1017a97cd-1765873722883.png",
      imageAlt:
        "Perfectly grilled salmon fillet with golden-brown grill marks on white plate with fresh herbs and lemon wedges",
      category: "main",
      rating: 4.8,
      reviewCount: 156,
      prepTime: 25,
      availability: "available",
      isPopular: true,
      isChefRecommended: true,
      dietary: ["gluten-free", "dairy-free"],
    },
    {
      id: 2,
      name: "Caesar Salad Supreme",
      description:
        "Crisp romaine lettuce tossed with classic Caesar dressing, parmesan cheese, and house-made croutons",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1598148147984-fe53fb44a15d",
      imageAlt:
        "Fresh Caesar salad with crispy romaine lettuce, golden croutons, and shaved parmesan cheese in white bowl",
      category: "appetizers",
      rating: 4.6,
      reviewCount: 89,
      prepTime: 10,
      availability: "available",
      isPopular: true,
      isChefRecommended: false,
      dietary: ["vegetarian"],
    },
    {
      id: 3,
      name: "Margherita Pizza",
      description:
        "Traditional Italian pizza with fresh mozzarella, ripe tomatoes, basil leaves, and extra virgin olive oil on thin crust",
      price: 16.99,
      image: "https://images.unsplash.com/photo-1677357861085-2e5b33fdd8f9",
      imageAlt:
        "Classic Margherita pizza with melted mozzarella cheese, red tomato sauce, and fresh green basil leaves on wooden board",
      category: "main",
      rating: 4.9,
      reviewCount: 234,
      prepTime: 20,
      availability: "available",
      isPopular: true,
      isChefRecommended: true,
      dietary: ["vegetarian"],
    },
    {
      id: 4,
      name: "Iced Caramel Latte",
      description:
        "Smooth espresso blended with cold milk, sweet caramel syrup, and topped with whipped cream and caramel drizzle",
      price: 5.99,
      image: "https://images.unsplash.com/photo-1658057542688-e32ef3883c85",
      imageAlt:
        "Tall glass of iced caramel latte with layers of coffee and milk, topped with whipped cream and caramel sauce drizzle",
      category: "drinks",
      rating: 4.7,
      reviewCount: 178,
      prepTime: 5,
      availability: "available",
      isPopular: false,
      isChefRecommended: false,
      dietary: ["vegetarian"],
    },
    {
      id: 5,
      name: "Beef Tenderloin Steak",
      description:
        "Premium USDA choice beef tenderloin grilled to your preference, served with garlic mashed potatoes and red wine reduction",
      price: 32.99,
      image: "https://images.unsplash.com/photo-1676300185292-e23bb3db50fa",
      imageAlt:
        "Juicy beef tenderloin steak with perfect grill marks on white plate with roasted vegetables and creamy mashed potatoes",
      category: "main",
      rating: 4.9,
      reviewCount: 312,
      prepTime: 30,
      availability: "low-stock",
      isPopular: true,
      isChefRecommended: true,
      dietary: ["gluten-free"],
    },
    {
      id: 6,
      name: "Bruschetta Trio",
      description:
        "Three varieties of toasted Italian bread topped with fresh tomatoes, basil pesto, and roasted red peppers",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1735136427251-dec3db6a8500",
      imageAlt:
        "Three pieces of golden toasted bruschetta with colorful toppings of diced tomatoes, green pesto, and red peppers on white plate",
      category: "appetizers",
      rating: 4.5,
      reviewCount: 67,
      prepTime: 12,
      availability: "available",
      isPopular: false,
      isChefRecommended: false,
      dietary: ["vegetarian", "vegan"],
    },
    {
      id: 7,
      name: "Chicken Tikka Masala",
      description:
        "Tender chicken pieces in rich, creamy tomato-based curry sauce with aromatic Indian spices, served with basmati rice",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1708782341807-ed35fc16b4ea",
      imageAlt:
        "Creamy orange chicken tikka masala curry in black bowl with tender chicken pieces and garnished with fresh cilantro",
      category: "main",
      rating: 4.8,
      reviewCount: 198,
      prepTime: 28,
      availability: "available",
      isPopular: true,
      isChefRecommended: false,
      dietary: ["gluten-free"],
    },
    {
      id: 8,
      name: "Fresh Fruit Smoothie",
      description:
        "Blend of strawberries, bananas, mangoes, and Greek yogurt with a touch of honey for natural sweetness",
      price: 6.99,
      image: "https://images.unsplash.com/photo-1692001123587-0ef6d1094469",
      imageAlt:
        "Vibrant pink smoothie in clear glass with fresh strawberries, banana slices, and colorful striped straw",
      category: "drinks",
      rating: 4.6,
      reviewCount: 145,
      prepTime: 5,
      availability: "available",
      isPopular: false,
      isChefRecommended: false,
      dietary: ["vegetarian", "gluten-free"],
    },
    {
      id: 9,
      name: "Lobster Bisque",
      description:
        "Rich and creamy lobster soup with chunks of fresh lobster meat, finished with cognac and fresh herbs",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1731694103079-25d002bbce8f",
      imageAlt:
        "Creamy orange lobster bisque soup in white bowl with chunks of lobster meat and garnished with fresh parsley",
      category: "appetizers",
      rating: 4.9,
      reviewCount: 223,
      prepTime: 15,
      availability: "low-stock",
      isPopular: true,
      isChefRecommended: true,
      dietary: ["gluten-free"],
    },
    {
      id: 10,
      name: "Vegan Buddha Bowl",
      description:
        "Nutritious bowl with quinoa, roasted chickpeas, avocado, kale, sweet potato, and tahini dressing",
      price: 15.99,
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_122675d96-1765285318929.png",
      imageAlt:
        "Colorful vegan Buddha bowl with sections of quinoa, roasted vegetables, chickpeas, and green kale in ceramic bowl",
      category: "main",
      rating: 4.7,
      reviewCount: 134,
      prepTime: 18,
      availability: "available",
      isPopular: false,
      isChefRecommended: true,
      dietary: ["vegan", "gluten-free", "dairy-free"],
    },
    {
      id: 11,
      name: "Craft Beer Selection",
      description:
        "Rotating selection of local craft beers on tap, ask your server for today's featured brews",
      price: 7.99,
      image: "https://images.unsplash.com/photo-1587040164502-d7a8b9aa9baa",
      imageAlt:
        "Golden craft beer in tall glass with white foam head on wooden bar counter with blurred bottles in background",
      category: "drinks",
      rating: 4.8,
      reviewCount: 267,
      prepTime: 2,
      availability: "available",
      isPopular: true,
      isChefRecommended: false,
      dietary: [],
    },
    {
      id: 12,
      name: "Truffle Mac & Cheese",
      description:
        "Creamy macaroni and cheese with three artisan cheeses, topped with truffle oil and crispy breadcrumbs",
      price: 13.99,
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1560fe4e7-1764740023899.png",
      imageAlt:
        "Creamy mac and cheese with golden breadcrumb topping in white ceramic dish with melted cheese visible",
      category: "main",
      rating: 4.6,
      reviewCount: 189,
      prepTime: 22,
      availability: "sold-out",
      isPopular: true,
      isChefRecommended: false,
      dietary: ["vegetarian"],
    },
  ];

  const getFilteredItems = () => {
    let filtered = menuItems;

    if (activeCategory !== "all") {
      filtered = filtered?.filter((item) => item?.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(
        (item) =>
          item?.name?.toLowerCase()?.includes(query) ||
          item?.description?.toLowerCase()?.includes(query)
      );
    }

    if (filters?.priceRange !== "all") {
      const [min, max] = filters?.priceRange
        ?.split("-")
        ?.map((v) => v?.replace("+", ""));
      filtered = filtered?.filter((item) => {
        if (max) {
          return (
            item?.price >= parseFloat(min) && item?.price <= parseFloat(max)
          );
        } else {
          return item?.price >= parseFloat(min);
        }
      });
    }

    if (filters?.dietary?.length > 0) {
      filtered = filtered?.filter((item) =>
        filters?.dietary?.some((diet) => item?.dietary?.includes(diet))
      );
    }

    if (filters?.availability?.length > 0) {
      filtered = filtered?.filter((item) =>
        filters?.availability?.includes(item?.availability)
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

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
