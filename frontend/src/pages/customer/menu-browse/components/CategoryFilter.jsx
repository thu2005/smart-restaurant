import React from "react";
import Icon from "../../../../components/AppIcon";

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories?.map((category) => {
        const isActive = activeCategory === category?.value;
        return (
          <button
            key={category?.value}
            onClick={() => onCategoryChange(category?.value)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap
              transition-smooth touch-target flex-shrink-0
              ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-warm"
                  : "bg-card text-foreground hover:bg-muted border border-border"
              }
            `}
            aria-label={`Filter by ${category?.label}`}
          >
            <Icon name={category?.icon} size={18} />
            <span className="font-medium text-sm md:text-base">
              {category?.label}
            </span>
            {category?.count > 0 && (
              <span
                className={`
                text-xs font-bold px-2 py-0.5 rounded-full
                ${isActive ? "bg-primary-foreground/20" : "bg-muted"}
              `}
              >
                {category?.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
