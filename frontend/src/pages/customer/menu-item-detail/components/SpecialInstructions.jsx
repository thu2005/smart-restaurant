import React from "react";
import Input from "../../../../components/ui/Input";

const SpecialInstructions = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
        Special Instructions
      </h3>
      <Input
        type="text"
        placeholder="e.g., No onions, extra sauce, well done..."
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        description="Let us know if you have any special requests for this item"
        className="w-full"
      />
    </div>
  );
};

export default SpecialInstructions;
