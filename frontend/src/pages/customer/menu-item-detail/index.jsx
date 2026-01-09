import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import menuService from "../../../services/menuService";
import orderService from "../../../services/orderService";
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

const MenuItemDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = useParams();

  const [cartItemCount] = useState(3);
  const [menuItem, setMenuItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState({
    size: "regular",
    extras: [],
  });
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
        // Don't set error, just use empty reviews
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
  const handleModifierChange = (type, value) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const calculateTotalPrice = () => {
    let total = menuItem?.basePrice || menuItem?.price || 0;

    const selectedSize = mockModifiers?.sizes?.find(
      (s) => s?.value === selectedModifiers?.size
    );
    if (selectedSize) {
      total += selectedSize?.priceModifier;
    }

    selectedModifiers?.extras?.forEach((extraId) => {
      const extra = mockModifiers?.extras?.find((e) => e?.id === extraId);
      if (extra) {
        total += extra?.price;
      }
    });

    return total * quantity;
  };

  const handleAddToCart = async () => {
    try {
      const orderItem = {
        menuItemId: menuItem.id,
        quantity,
        specialInstructions,
      };

      // For now, create order immediately (single item)
      // Later can be modified to add to a cart before checkout
      const orderData = {
        items: [orderItem],
        customerName: localStorage.getItem('customerName') || '',
        customerPhone: localStorage.getItem('customerPhone') || '',
        specialInstructions: `Added ${menuItem.name} with modifiers: ${JSON.stringify(selectedModifiers)}`
      };

      const result = await orderService.createOrder(orderData);
      console.log("Order created:", result);
      
      // Navigate to order confirmation or back to menu
      navigate("/customer/menu", { 
        state: { 
          message: `Order placed successfully! Order ID: ${result.data?.id}`,
          orderData: result.data 
        } 
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleBackToMenu = () => {
    navigate("/customer/menu-browse");
  };

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

  const mockModifierGroups = {
    id: "item-001",
    name: "Grilled Salmon with Herb Butter",
    description:
      "Fresh Atlantic salmon fillet grilled to perfection, topped with house-made herb butter and served with seasonal vegetables and garlic mashed potatoes. Our signature dish features sustainably sourced salmon, seasoned with a blend of Mediterranean herbs and finished with a touch of lemon zest.",
    basePrice: 250000,
    rating: 4.7,
    reviewCount: 156,
    prepTime: 25,
    calories: 520,
    isSpicy: false,
    availability: "available",
    allergens: ["Fish", "Dairy", "Garlic"],
    images: [
      {
        url: "https://img.rocket.new/generatedImages/rocket_gen_img_1017a97cd-1765873722883.png",
        alt: "Grilled salmon fillet with golden herb butter on white plate with roasted vegetables and mashed potatoes",
      },
      {
        url: "https://images.unsplash.com/photo-1614336226441-c901df03acc9",
        alt: "Close-up view of perfectly grilled salmon showing flaky texture with herb garnish",
      },
      {
        url: "https://images.unsplash.com/photo-1701540747595-7459282d0f51",
        alt: "Side angle of salmon dish with colorful seasonal vegetables and creamy mashed potatoes",
      },
      {
        url: "https://images.unsplash.com/photo-1551218372-063893c540ce",
        alt: "Overhead shot of complete salmon meal presentation with garnishes and side dishes",
      },
    ],
  };

  const mockModifiers = {
    sizes: [
      {
        id: "size-regular",
        value: "regular",
        label: "Regular",
        description: "6 oz portion",
        priceModifier: 0,
      },
      {
        id: "size-large",
        value: "large",
        label: "Large",
        description: "9 oz portion",
        priceModifier: 60000,
      },
      {
        id: "size-family",
        value: "family",
        label: "Family Size",
        description: "16 oz portion",
        priceModifier: 120000,
      },
    ],

    extras: [
      {
        id: "extra-001",
        label: "Extra Herb Butter",
        description: "Additional serving of house-made herb butter",
        price: 25000,
      },
      {
        id: "extra-002",
        label: "Grilled Asparagus",
        description: "Fresh asparagus spears with olive oil",
        price: 45000,
      },
      {
        id: "extra-003",
        label: "Caesar Salad",
        description: "Classic Caesar with parmesan and croutons",
        price: 50000,
      },
      {
        id: "extra-004",
        label: "Garlic Bread",
        description: "Toasted bread with garlic butter",
        price: 35000,
      },
    ],
  };

  const mockReviews = [
    {
      id: "review-001",
      userName: "Sarah Mitchell",
      userAvatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_10df5a971-1765003957966.png",
      userAvatarAlt:
        "Professional woman with brown hair in business attire smiling at camera",
      rating: 5,
      date: "Dec 15, 2025",
      comment:
        "Absolutely delicious! The salmon was cooked perfectly - crispy on the outside and tender inside. The herb butter added such a wonderful flavor. Best salmon I've had in a restaurant!",
    },
    {
      id: "review-002",
      userName: "James Rodriguez",
      userAvatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_13539cf1a-1763294982283.png",
      userAvatarAlt:
        "Hispanic man with short black hair wearing casual blue shirt",
      rating: 4,
      date: "Dec 12, 2025",
      comment:
        "Great dish overall. The salmon was fresh and well-seasoned. Only minor complaint is that the portion could be slightly larger for the price, but the quality makes up for it.",
    },
    {
      id: "review-003",
      userName: "Emily Chen",
      userAvatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_19df0724d-1763296558442.png",
      userAvatarAlt:
        "Asian woman with long black hair in elegant dress smiling warmly",
      rating: 5,
      date: "Dec 10, 2025",
      comment:
        "This is my go-to order every time I visit! The vegetables are always fresh and the mashed potatoes are incredibly creamy. Highly recommend getting the extra herb butter!",
    },
    {
      id: "review-004",
      userName: "Michael Thompson",
      userAvatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_198f9218f-1763295166542.png",
      userAvatarAlt:
        "Young man with blonde hair in casual attire with friendly expression",
      rating: 5,
      date: "Dec 8, 2025",
      comment:
        "Outstanding preparation and presentation. You can tell they use quality ingredients. The salmon was perfectly grilled with a nice char. Will definitely order again!",
    },
  ];

  const mockRatingDistribution = [
    { stars: 5, count: 98 },
    { stars: 4, count: 42 },
    { stars: 3, count: 12 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 },
  ];

  const mockRelatedItems = [
    {
      id: "item-002",
      name: "Pan-Seared Sea Bass",
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_16693a006-1764861303481.png",
      imageAlt:
        "Pan-seared sea bass fillet with crispy skin on white plate with lemon wedges",
      rating: 4.6,
      reviewCount: 89,
      price: 270000,
      isNew: false,
    },
    {
      id: "item-003",
      name: "Lobster Tail Dinner",
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_197306902-1765877501126.png",
      imageAlt:
        "Grilled lobster tail with melted butter and fresh herbs on elegant plate",
      rating: 4.9,
      reviewCount: 124,
      price: 350000,
      isNew: true,
    },
    {
      id: "item-004",
      name: "Shrimp Scampi Pasta",
      image:
        "https://img.rocket.new/generatedImages/rocket_gen_img_14d967011-1765259508208.png",
      imageAlt:
        "Linguine pasta with large shrimp in garlic butter sauce with parsley",
      rating: 4.5,
      reviewCount: 76,
      price: 230000,
      isNew: false,
    },
    {
      id: "item-005",
      name: "Grilled Tuna Steak",
      image: "https://images.unsplash.com/photo-1614187973334-9e1d30848d3c",
      imageAlt:
        "Seared tuna steak with sesame crust and Asian vegetables on black plate",
      rating: 4.7,
      reviewCount: 92,
      price: 290000,
      isNew: false,
    },
  ];

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
  ];

  const isAvailable = menuItem?.availability === "available";

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
              <ImageGallery images={menuItem?.images} />
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
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotalPrice())}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="lg"
                    iconName="ShoppingCart"
                    iconPosition="left"
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    fullWidth
                  >
                    {isAvailable ? "Add to Cart" : "Currently Unavailable"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 md:space-y-12">
            <NutritionalInfo
              nutritionalData={mockNutritionalData}
              ingredients={mockIngredients}
            />

            <ReviewSection
              reviews={reviews}
              overallRating={menuItem?.rating}
              ratingDistribution={mockRatingDistribution}
              loading={reviewsLoading}
            />

            <RelatedItems items={mockRelatedItems} />
          </div>
        </div>
      </main>
      <StickyAddToCart
        totalPrice={calculateTotalPrice()}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        isAvailable={isAvailable}
      />
    </div>
  );
};

export default MenuItemDetail;
