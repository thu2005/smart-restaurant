import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
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

const MenuItemDetail = () => {
  const { t } = useTranslation();
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
            toast.error(t('customer.itemDetail.customization.select', { count: group.name }), {
              description: t('customer.itemDetail.customization.required'),
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
      toast.error(t('common.error.generic'), {
        description: t('common.error.tryAgain'),
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
          <p className="text-gray-600">{t("customer.itemDetail.loading")}</p>
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
            {t("customer.itemDetail.notFound.title")}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || t("customer.itemDetail.notFound.message")}
          </p>
          <Button onClick={() => navigate("/customer/menu-browse")}>
            {t("customer.itemDetail.backToMenu")}
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
              {t("customer.itemDetail.backToMenu")}
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
                        {t("customer.itemDetail.totalItems", { count: quantity })}
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
                      ? (editingItem ? t("customer.itemDetail.updateCart") : t("customer.menu.item.addToCart"))
                      : t("customer.itemDetail.unavailable")}
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
        buttonText={editingItem ? t("customer.itemDetail.updateCart") : t("customer.menu.item.addToCart")}
      />
    </div>
  );
};

export default MenuItemDetail;
