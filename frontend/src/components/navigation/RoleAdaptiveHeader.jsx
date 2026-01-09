import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "../ui/Button";

const RoleAdaptiveHeader = ({ userRole = "customer", cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customerNavItems = [
    { path: "/menu-browse", label: "Menu", icon: "UtensilsCrossed" },
    {
      path: "/shopping-cart",
      label: "Cart",
      icon: "ShoppingCart",
      badge: cartItemCount,
    },
    {
      path: "/order-status-tracking",
      label: "Order Status",
      icon: "ClipboardList",
    },
  ];

  const adminNavItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    {
      path: "/kitchen/dashboard",
      label: "Kitchen Display",
      icon: "ChefHat",
    },
    { path: "/menu-browse", label: "Menu", icon: "UtensilsCrossed" },
  ];

  const navItems = userRole === "admin" ? adminNavItems : customerNavItems;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-card border-b border-border shadow-warm">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() =>
                handleNavigation(
                  userRole === "admin" ? "/admin/dashboard" : "/menu-browse"
                )
              }
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon
                  name="UtensilsCrossed"
                  size={24}
                  color="var(--color-primary)"
                />
              </div>
              <span className="text-xl font-heading font-semibold text-foreground">
                Smart Restaurant
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems?.slice(0, 4)?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-md
                    transition-smooth touch-target
                    ${isActivePath(item?.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <Icon name={item?.icon} size={20} />
                  <span className="font-medium">{item?.label}</span>
                  {item?.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {item?.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {userRole === "customer" && cartItemCount > 0 && (
              <Button
                variant="default"
                size="default"
                iconName="ShoppingCart"
                iconPosition="left"
                onClick={() => handleNavigation("/shopping-cart")}
                className="hidden md:flex"
              >
                View Cart ({cartItemCount})
              </Button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-muted transition-smooth touch-target"
              aria-label="Toggle menu"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>
      </header>
      {mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[120] bg-background md:hidden">
          <div className="absolute top-4 right-6">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-muted transition-smooth"
            >
              <Icon name="X" size={32} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 p-6 pt-20">
            {navItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  relative flex items-center gap-3 px-6 py-4 rounded-md
                  transition-smooth touch-target-lg
                  ${isActivePath(item?.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                  }
                `}
              >
                <Icon name={item?.icon} size={24} />
                <span className="text-lg font-medium">{item?.label}</span>
                {item?.badge > 0 && (
                  <span className="ml-auto w-6 h-6 bg-error text-error-foreground text-sm font-bold rounded-full flex items-center justify-center">
                    {item?.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>,
        document.body
      )}
    </>
  );
};

export default RoleAdaptiveHeader;
