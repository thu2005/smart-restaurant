import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import menuService from "../../../services/menuService";
import { useCart } from "../../../contexts/CartContext";
import ImageGallery from "./components/ImageGallery";
import ItemInfo from "./components/ItemInfo";
import CustomizationPanel from "./components/CustomizationPanel";
import QuantitySelector from "./components/QuantitySelector";
import SpecialInstructions from "./components/SpecialInstructions";
import ReviewSection from "./components/ReviewSection";
import RelatedItems from "./components/RelatedItems";
import NutritionalInfo from "./components/NutritionalInfo";
import StickyAddToCart from "./components/StickyAddToCart";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

// Mock Data for missing backend features
const mockNutritionalData = [
  { label: "Calories", value: "520" },
  { label: "Protein", value: "42g" },
  { label: "Carbs", value: "28g" },
  { label: "Fat", value: "26g" },
  { label: "Fiber", value: "4g" },
  { label: "Sodium", value: "680mg" },
  { label: "Sugar", value: "3g" },
  { label: "Cholesterol", value: "95mg" },
];

const mockIngredients = [
  "Atlantic Salmon",
  "Butter",
  "Fresh Herbs (Parsley, Dill, Thyme)",
  "Garlic",
  "Lemon",
  "Olive Oil",
  "Potatoes",
  "Heavy Cream",
  "Seasonal Vegetables",
  "Salt",
  "Black Pepper",
  "Other",
];

const mockRatingDistribution = [
  { stars: 5, count: 0 },
  { stars: 4, count: 0 },
  { stars: 3, count: 0 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

const mockRelatedItems = [
  {
    id: "item-002",
    name: "Pan-Seared Sea Bass",
    image: "https://images.unsplash.com/photo-1580959375944-0b7b9e7d6b3e",
    rating: 4.6,
    reviewCount: 89,
    price: 270000,
    isNew: false,
  },
  {
    id: "item-003",
    name: "Lobster Tail Dinner",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
    rating: 4.9,
    reviewCount: 124,
    price: 350000,
    isNew: true,
  },
  {
    id: "item-004",
    name: "Shrimp Scampi Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",
    rating: 4.5,
    reviewCount: 76,
    price: 230000,
    isNew: false,
  },
  {
    id: "item-005",
    name: "Grilled Tuna Steak",
    image: "https://images.unsplash.com/photo-1614187973334-9e1d30848d3c",
    rating: 4.7,
    reviewCount: 92,
    price: 290000,
    isNew: false,
  },
];

const MenuItemDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = useParams();
  const { addToCart, updateItem, getCartSummary } = useCart();
  
  const editingItem = location.state?.editingItem;

  const [menuItem, setMenuItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!itemId) {
        setError("Menu item ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const item = await menuService.getItemById(itemId);
        setMenuItem(item);

        // Init modifiers
        let initialModifiers = {};

        if (editingItem && editingItem.menuItemId === itemId) {
          // EDIT MODE: Populate from existing cart item
          setQuantity(editingItem.quantity);
          setSpecialInstructions(editingItem.specialInstructions || "");
          
          if (item?.modifier_groups) {
             item.modifier_groups.forEach(group => {
                const groupModifiers = editingItem.modifiers?.filter(m => m.groupName === group.name) || [];
                
                if (groupModifiers.length > 0) {
                   if (group.selectionType === 'single') {
                      initialModifiers[group.id] = groupModifiers[0].id;
                   } else {
                      // Multiple or Addon
                      initialModifiers[group.id] = groupModifiers.map(m => ({
                         id: m.id,
                         quantity: m.quantity || 1
                      }));
                   }
                } else if (group.selectionType === 'multiple') {
                   initialModifiers[group.id] = [];
                }
             });
          }
        } else {
          // NEW ITEM MODE: Default init
          if (item?.modifier_groups) {
            item.modifier_groups.forEach((group) => {
              if (
                group.selectionType === "single" &&
                group.isRequired &&
                group.options?.length > 0
              ) {
                initialModifiers[group.id] = group.options[0].id;
              } else if (group.selectionType === "multiple") {
                initialModifiers[group.id] = [];
              }
            });
          }
        }
        
        setSelectedModifiers(initialModifiers);

      } catch (err) {
        console.error("Failed to fetch menu item:", err);
        setError("Failed to load menu item details");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [itemId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!itemId) return;

      try {
        setReviewsLoading(true);
        const reviewsData = await menuService.getReviews(itemId);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [itemId]);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Event handlers
  const handleModifierChange = (groupId, value) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [groupId]: value,
    }));
  };

  const calculateTotalPrice = () => {
    let total = menuItem?.price || 0;

    if (menuItem?.modifier_groups) {
      Object.entries(selectedModifiers).forEach(([groupId, selection]) => {
        const group = menuItem.modifier_groups.find((g) => g.id === groupId);
        if (!group) return;

        if (Array.isArray(selection)) {
          // Multiple selection or Addons
          selection.forEach((item) => {
            const optId = typeof item === 'object' ? item.id : item;
            const qty = typeof item === 'object' ? (item.quantity || 1) : 1;
            
            const opt = group.options?.find((o) => o.id === optId);
            if (opt) total += (opt.priceAdjustment || 0) * qty;
          });
        } else {
          // Single selection (always just ID)
          const opt = group.options?.find((o) => o.id === selection);
          if (opt) total += opt.priceAdjustment || 0;
        }
      });
    }

    return total * quantity;
  };

  const handleAddToCart = () => {
    try {
      // Validate required modifiers
      if (menuItem?.modifier_groups) {
        for (const group of menuItem.modifier_groups) {
          if (
            group.isRequired &&
            group.selectionType === "single" &&
            !selectedModifiers[group.id]
          ) {
            toast.error(`Please select a ${group.name}`, {
              description: "This option is required.",
              duration: 3000
            });
            return;
          }
        }
      }

      // Calculate base price with modifiers
      let itemPrice = menuItem?.price || 0;
      const modifiersList = [];

      if (menuItem?.modifier_groups) {
        Object.entries(selectedModifiers).forEach(([groupId, selection]) => {
          const group = menuItem.modifier_groups.find((g) => g.id === groupId);
          if (!group) return;

          if (Array.isArray(selection)) {
            // Multiple selection or Addons
            selection.forEach((item) => {
              const optId = typeof item === 'object' ? item.id : item;
              const qty = typeof item === 'object' ? (item.quantity || 1) : 1;
              
              const opt = group.options?.find((o) => o.id === optId);
              if (opt) {
                itemPrice += (opt.priceAdjustment || 0) * qty;
                modifiersList.push({
                  id: opt.id,
                  name: opt.name,
                  groupName: group.name,
                  quantity: qty,
                  priceAdjustment: opt.priceAdjustment || 0,
                });
              }
            });
          } else {
            // Single selection
            const opt = group.options?.find((o) => o.id === selection);
            if (opt) {
              itemPrice += opt.priceAdjustment || 0;
              modifiersList.push({
                id: opt.id,
                name: opt.name,
                groupName: group.name,
                quantity: 1, // Default quantity
                priceAdjustment: opt.priceAdjustment || 0,
              });
            }
          }
        });
      }

      // Add to cart
      // Add to cart or Update cart
      if (editingItem) {
         updateItem(editingItem.cartId, {
            price: itemPrice,
            quantity: quantity,
            modifiers: modifiersList,
            specialInstructions: specialInstructions,
            prepTime: menuItem.prepTime || 15,
         });
      } else {
         addToCart({
           menuItemId: menuItem.id,
           name: menuItem.name,
           image: menuItem.image || menuItem.photos?.find(p => p.isPrimary)?.url || menuItem.photos?.[0]?.url,
           price: itemPrice,
           quantity: quantity,
           modifiers: modifiersList,
           specialInstructions: specialInstructions,
           prepTime: menuItem.prepTime || 15,
         });
      }

      // Navigate to cart
      navigate("/customer/shopping-cart");
    } catch (error) {
      console.error("Failed to add/update cart:", error);
      toast.error("Failed to process request", {
        description: "Please try again.",
        duration: 3000
      });
    }
  };

  const handleBackToMenu = () => {
    navigate("/customer/menu-browse");
  };

  const isAvailable =
    menuItem?.availability === "available" || menuItem?.isAvailable;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu item...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !menuItem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Icon name="AlertCircle" size={48} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Item Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The requested menu item could not be found."}
          </p>
          <Button onClick={() => navigate("/customer/menu-browse")}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-4 md:mb-6 touch-target"
          >
            <Icon name="ArrowLeft" size={20} />
            <span className="text-sm md:text-base font-medium">
              Back to Menu
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12">
            <div>
              <ImageGallery images={menuItem?.images || menuItem?.photos} />
            </div>

            <div className="space-y-4 md:space-y-6">
              <ItemInfo item={menuItem} />

              <div className="p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border space-y-4 md:space-y-6">
                <CustomizationPanel
                  modifiers={menuItem?.modifier_groups || []}
                  selectedModifiers={selectedModifiers}
                  onModifierChange={handleModifierChange}
                />

                <div className="pt-4 border-t border-border">
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                  />
                </div>

                <SpecialInstructions
                  value={specialInstructions}
                  onChange={setSpecialInstructions}
                />

                <div className="hidden lg:block pt-4 border-t border-border">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total ({quantity} {quantity === 1 ? "item" : "items"})
                      </p>
                      <p className="text-3xl font-heading font-bold text-primary data-text">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(calculateTotalPrice())}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="lg"
                    iconName={editingItem ? "Check" : "ShoppingCart"}
                    iconPosition="left"
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    fullWidth
                  >
                    {isAvailable 
                      ? (editingItem ? "Update Cart" : "Add to Cart") 
                      : "Currently Unavailable"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:space-y-12">
            {/* Nutritional Info */}
            <section>
              <NutritionalInfo data={mockNutritionalData} />
            </section>

            {/* Review Section */}
            <section id="reviews">
              <ReviewSection
                reviews={reviews}
                avgRating={menuItem.averageRating}
                totalReviews={menuItem.totalReviews}
                loading={reviewsLoading}
              />
            </section>

            {/* Related Items */}
            <section>
              <RelatedItems
                categoryId={menuItem.categoryId}
                currentId={menuItem.id}
              />
            </section>
          </div>
        </div>
      </main>
      <StickyAddToCart
        totalPrice={calculateTotalPrice()}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        isAvailable={isAvailable}
        buttonText={editingItem ? "Update Cart" : "Add to Cart"}
      />
    </div>
  );
};

export default MenuItemDetail;
