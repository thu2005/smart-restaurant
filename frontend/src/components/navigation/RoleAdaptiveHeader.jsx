import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "../ui/Button";
import authService from "../../services/authService";

const RoleAdaptiveHeader = ({ userRole = "customer", cartItemCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [tableId, setTableId] = useState(sessionStorage.getItem("tableId"));

  useEffect(() => {
    // Refresh user and table info on mount
    setUser(authService.getCurrentUser());
    setTableId(sessionStorage.getItem("tableId"));
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
  };

  const customerNavItems = [
    { path: "/customer/menu-browse", label: "Menu", icon: "UtensilsCrossed" },
    {
      path: "/customer/shopping-cart",
      label: "Cart",
      icon: "ShoppingCart",
      badge: cartItemCount,
    },
    {
      path: "/customer/order-status-tracking",
      label: "Order Status",
      icon: "ClipboardList",
    },
  ];

  const adminNavItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    {
      path: "/admin/kitchen/dashboard",
      label: "Kitchen Display",
      icon: "ChefHat",
    },
    { path: "/customer/menu-browse", label: "Menu", icon: "UtensilsCrossed" },
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
      <header className="sticky top-0 z-[100] bg-card border-b border-border shadow-sm">
        <div className="relative flex items-center justify-between h-14 px-4 md:h-16 md:px-6">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 md:gap-3 cursor-pointer"
            onClick={() =>
              handleNavigation(
                userRole === "admin"
                  ? "/admin/dashboard"
                  : "/customer/menu-browse"
              )
            }
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-heading font-semibold text-foreground truncate max-w-[150px] md:max-w-none">
              Smart Restaurant
            </span>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
            {navItems?.slice(0, 4)?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-full
                  transition-smooth touch-target
                  ${
                    isActivePath(item?.path)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted hover:text-primary"
                  }
                `}
              >
                <Icon name={item?.icon} size={20} />
                <span className="font-medium">{item?.label}</span>
                {item?.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm border border-white">
                    {item?.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Table Info */}
            {tableId && (
              <div className="flex items-center px-3 py-1.5 border border-1 border-primary rounded-full shadow-sm">
                <span className="text-xs md:text-sm font-bold text-green-800 whitespace-nowrap">
                  Table {tableId}
                </span>
              </div>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-medium text-gray-700 leading-none">
                    {user.name || "Customer"}
                  </span>
                  <span className="text-xs text-gray-500 leading-none mt-1">
                    Member
                  </span>
                </div>
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                  {(user.name || "C").charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <Icon name="LogOut" size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="hidden md:flex"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="md:hidden text-xs px-2 h-8"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="text-xs md:text-sm px-3 md:px-4 h-8 md:h-9"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const active = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full space-y-1
                  transition-colors duration-200
                  ${
                    active
                      ? "text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                <div className="relative">
                  <Icon
                    name={item.icon}
                    size={24}
                    className={active ? "stroke-[2.5px]" : "stroke-2"}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    active ? "font-semibold" : ""
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default RoleAdaptiveHeader;
