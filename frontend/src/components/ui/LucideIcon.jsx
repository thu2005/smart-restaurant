import React from "react";
import { icons } from "lucide-react";

const LucideIcon = ({ name, color, size }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon color={color} size={size} />;
};

export default LucideIcon;
