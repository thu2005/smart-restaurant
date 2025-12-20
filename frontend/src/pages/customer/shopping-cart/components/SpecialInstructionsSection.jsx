import React, { useState } from "react";
import Icon from "../../../../components/AppIcon";

const SpecialInstructionsSection = ({ value, onChange }) => {
  const [charCount, setCharCount] = useState(value?.length || 0);
  const maxChars = 200;

  const handleChange = (e) => {
    const newValue = e?.target?.value;
    if (newValue?.length <= maxChars) {
      setCharCount(newValue?.length);
      onChange(newValue);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-warm">
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Icon name="MessageSquare" size={20} className="text-primary" />
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
          Special Instructions
        </h3>
      </div>

      <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
        Add any dietary requirements, allergies, or special requests for the
        kitchen
      </p>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="E.g., No onions, extra spicy, gluten-free preparation..."
        className="w-full min-h-[100px] md:min-h-[120px] p-3 md:p-4 bg-background border border-input rounded-md text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-smooth"
        aria-label="Special instructions for your order"
      />

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs md:text-sm text-muted-foreground">
          Optional - Help us serve you better
        </p>
        <p className="text-xs md:text-sm text-muted-foreground data-text">
          {charCount}/{maxChars}
        </p>
      </div>
    </div>
  );
};

export default SpecialInstructionsSection;
