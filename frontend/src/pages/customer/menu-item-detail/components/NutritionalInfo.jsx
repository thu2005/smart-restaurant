import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";

const NutritionalInfo = ({ data, loading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Transform nutritionalInfo object to array format for display
  const formatNutritionalData = (nutritionalInfo) => {
    if (!nutritionalInfo || typeof nutritionalInfo !== "object") return [];

    return Object.entries(nutritionalInfo).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
      value: value,
    }));
  };

  const nutritionalData = formatNutritionalData(data?.nutritionalInfo);
  const ingredients = data?.ingredients || [];
  const allergens = data?.allergens || [];

  return (
    <div className="space-y-3 md:space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border hover:border-primary/50 transition-smooth touch-target"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Info" size={20} color="var(--color-primary)" />
          </div>
          <span className="text-base md:text-lg font-heading font-semibold text-foreground">
            Nutritional Information & Ingredients
          </span>
        </div>
        <Icon
          name={isExpanded ? "ChevronUp" : "ChevronDown"}
          size={20}
          color="var(--color-muted-foreground)"
        />
      </button>
      {isExpanded && (
        <div className="p-4 md:p-6 bg-card rounded-lg md:rounded-xl border border-border space-y-4 md:space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading nutritional information...
              </span>
            </div>
          ) : (
            <>
              {/* Nutritional Facts */}
              {nutritionalData && nutritionalData.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3">
                    Nutrition Facts
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {nutritionalData.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 md:p-4 bg-muted rounded-lg text-center"
                      >
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">
                          {item.label}
                        </p>
                        <p className="text-lg md:text-xl font-heading font-bold text-foreground data-text">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {ingredients && ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3">
                    Ingredients
                  </h3>
                  <p className="text-sm md:text-base text-foreground leading-relaxed">
                    {ingredients.join(", ")}
                  </p>
                </div>
              )}

              {/* Allergens */}
              {allergens && allergens.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-3">
                    Allergens
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full border border-orange-200"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionalInfo;
