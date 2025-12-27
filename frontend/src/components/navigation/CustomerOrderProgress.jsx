import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";

const CustomerOrderProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { path: "/menu-browse", label: "Browse Menu", icon: "UtensilsCrossed" },
    { path: "/menu-item-detail", label: "Item Details", icon: "FileText" },
    { path: "/shopping-cart", label: "Cart", icon: "ShoppingCart" },
  ];

  const getCurrentStepIndex = () => {
    const currentPath = location?.pathname;
    const index = steps?.findIndex((step) => step?.path === currentPath);
    return index !== -1 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStepIndex) {
      navigate(steps?.[stepIndex]?.path);
    }
  };

  return (
    <div className="customer-progress-indicator bg-card border-b border-border">
      <div className="flex items-center justify-center">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.path}>
            <div className="progress-step">
              <button
                onClick={() => handleStepClick(index)}
                disabled={index > currentStepIndex}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md transition-smooth
                  ${
                    index <= currentStepIndex
                      ? "cursor-pointer hover:bg-muted"
                      : "cursor-not-allowed opacity-50"
                  }
                  ${index === currentStepIndex ? "bg-primary/10" : ""}
                `}
                aria-label={step?.label}
              >
                <div className="hidden sm:block">
                  <Icon
                    name={step?.icon}
                    size={18}
                    color={
                      index < currentStepIndex
                        ? "var(--color-success)"
                        : index === currentStepIndex
                        ? "var(--color-primary)"
                        : "var(--color-muted-foreground)"
                    }
                  />
                </div>
                <div
                  className={`
                    progress-dot
                    ${index < currentStepIndex ? "completed" : ""}
                    ${index === currentStepIndex ? "active" : ""}
                  `}
                />
                <span
                  className={`
                  hidden md:inline text-sm font-medium
                  ${index < currentStepIndex ? "text-success" : ""}
                  ${
                    index === currentStepIndex
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                `}
                >
                  {step?.label}
                </span>
              </button>
            </div>
            {index < steps?.length - 1 && (
              <div
                className={`
                  progress-line
                  ${index < currentStepIndex ? "completed" : ""}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CustomerOrderProgress;
