import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "../ui/Button";

const AdminDashboardSidebar = ({
  isCollapsed = false,
  onCollapseToggle,
  isMobileOpen = false,
  onMobileToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [mobileOpen, setMobileOpen] = useState(isMobileOpen);

  const collapsed = onCollapseToggle ? isCollapsed : localCollapsed;

  useEffect(() => {
    setMobileOpen(isMobileOpen);
  }, [isMobileOpen]);

  const navigationItems = [
    {
      section: "Main",
      items: [
        {
          path: "/admin/dashboard",
          label: "Dashboard",
          icon: "LayoutDashboard",
        },
        {
          path: "/kitchen/dashboard",
          label: "Kitchen Display",
          icon: "ChefHat",
        },
      ],
    },
    {
      section: "Management",
      items: [
        {
          path: "/admin/menu/items",
          label: "Menu Items",
          icon: "UtensilsCrossed",
        },
        {
          path: "/admin/menu/categories",
          label: "Categories",
          icon: "List",
        },
        {
          path: "/admin/menu/modifiers",
          label: "Modifiers",
          icon: "Settings",
        },
        { path: "/admin/orders", label: "Orders", icon: "ShoppingBag" },
        { path: "/admin/tables", label: "Tables", icon: "Grid3x3" },
      ],
    },
    {
      section: "Reports",
      items: [
        { path: "/admin/reports", label: "Reports & Analytics", icon: "BarChart3" },
      ],
    },
    {
      section: "Settings",
      items: [
        { path: "/settings", label: "Settings", icon: "Settings" },
        { path: "/help", label: "Help", icon: "HelpCircle" },
      ],
    },
  ];

  const mobileNavItems = [
    { path: "/admin-dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/kitchen-display-system", label: "Kitchen", icon: "ChefHat" },
    { path: "/menu-browse", label: "Menu", icon: "UtensilsCrossed" },
    { path: "/admin/orders", label: "Orders", icon: "ShoppingBag" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
      onMobileToggle?.(false);
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleCollapse = () => {
    if (onCollapseToggle) {
      onCollapseToggle(!collapsed);
    } else {
      setLocalCollapsed(!collapsed);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setMobileOpen(!mobileOpen);
          onMobileToggle?.(!mobileOpen);
        }}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-card rounded-md shadow-warm hover:bg-muted transition-smooth touch-target"
        aria-label="Toggle sidebar"
      >
        <Icon name="Menu" size={24} />
      </button>
      <aside
        className={`
        admin-sidebar
        ${collapsed ? "collapsed" : ""}
        ${!mobileOpen ? "mobile-hidden" : ""}
      `}
      >
        <div
          className={`admin-sidebar-header transition-all duration-300 ${collapsed ? "px-2 justify-center" : "px-4 justify-between"
            }`}
        >
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "flex-1"
              }`}
          >
            <div
              className={`${collapsed ? "w-10 h-10" : "w-12 h-12"
                } bg-primary/5 rounded-lg flex items-center justify-center transition-all duration-300 overflow-hidden flex-shrink-0`}
            >
              <img
                src="https://ik.imagekit.io/thu2005/Gemini_Generated_Image_cl11tdcl11tdcl11-removebg-preview.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <span className="ml-3 font-bold text-lg tracking-tight text-foreground whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                Smart Restaurant
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            iconName={collapsed ? "ChevronRight" : "ChevronLeft"}
            onClick={toggleCollapse}
            className={`hidden lg:flex transition-all duration-300 ${collapsed
              ? "absolute -right-3 top-1/2 -translate-y-1/2 bg-white border shadow-sm rounded-full z-50"
              : ""
              }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {navigationItems?.map((section) => (
            <div key={section?.section} className="mb-6">
              {!collapsed && (
                <div className="px-6 py-2">
                  <span className="text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider">
                    {section?.section}
                  </span>
                </div>
              )}
              <nav className="admin-sidebar-nav">
                {section?.items?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`
                      admin-sidebar-item
                      ${isActivePath(item?.path) ? "active" : ""}
                    `}
                    aria-label={item?.label}
                  >
                    <Icon name={item?.icon} size={20} />
                    <span className="font-medium">{item?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <div className="lg:hidden admin-sidebar-mobile-bottom">
        {mobileNavItems?.map((item) => (
          <button
            key={item?.path}
            onClick={() => handleNavigation(item?.path)}
            className={`
              admin-sidebar-mobile-item
              ${isActivePath(item?.path) ? "active" : ""}
            `}
            aria-label={item?.label}
          >
            <Icon name={item?.icon} size={24} />
            <span>{item?.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default AdminDashboardSidebar;
