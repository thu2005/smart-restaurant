import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "../ui/Button";
import authService from "../../services/authService";
import { useTranslation } from "react-i18next";

const AdminDashboardSidebar = ({
  isCollapsed = false,
  onCollapseToggle,
  isMobileOpen = false,
  onMobileToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [mobileOpen, setMobileOpen] = useState(isMobileOpen);

  const collapsed = onCollapseToggle ? isCollapsed : localCollapsed;
  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    setMobileOpen(isMobileOpen);
  }, [isMobileOpen]);

  // Super Admin only sees user management
  const superAdminNavigationItems = [
    {
      section: t("nav.sections.userManagement"),
      items: [
        {
          path: "/admin/users",
          label: t("nav.items.manageAdmins"),
          icon: "Users",
        },
      ],
    },
  ];

  // Regular admin sees all menu and operations
  const navigationItems = [
    {
      section: t("nav.sections.main"),
      items: [
        {
          path: "/admin/dashboard",
          label: t("nav.items.dashboard"),
          icon: "LayoutDashboard",
        },
        {
          path: "/admin/kitchen/dashboard",
          label: t("nav.items.kitchen"),
          icon: "ChefHat",
        },
      ],
    },
    {
      section: t("nav.sections.management"),
      items: [
        {
          path: "/admin/menu/items",
          label: t("nav.items.menu"),
          icon: "UtensilsCrossed",
        },
        {
          path: "/admin/menu/categories",
          label: t("nav.items.categories"),
          icon: "List",
        },
        {
          path: "/admin/menu/modifiers",
          label: t("nav.items.modifiers"),
          icon: "Settings",
        },
        { path: "/admin/orders", label: t("nav.items.orders"), icon: "ShoppingBag" },
        { path: "/admin/tables", label: t("nav.items.tables"), icon: "Grid3x3" },
      ],
    },
    {
      section: t("nav.sections.reports"),
      items: [
        { path: "/admin/reports", label: t("nav.items.reports"), icon: "BarChart3" },
        { path: "/admin/analytics", label: t("nav.items.BIreports"), icon: "Presentation" },
      ],
    },
    {
      section: t("nav.sections.account"),
      items: [
        { path: "/admin/users", label: t("nav.items.staff"), icon: "Users" },
        { path: "/admin/settings", label: t("nav.items.settings"), icon: "Settings" },
        { path: "/admin/help", label: t("nav.items.help"), icon: "HelpCircle" },
      ],
    },
  ];

  const mobileNavItems = [
    { path: "/admin-dashboard", label: t("nav.items.dashboard"), icon: "LayoutDashboard" },
    { path: "/kitchen-display-system", label: t("nav.items.kitchen"), icon: "ChefHat" },
    { path: "/menu-browse", label: t("nav.items.menuBrowse"), icon: "UtensilsCrossed" },
    { path: "/admin/orders", label: t("nav.items.orders"), icon: "ShoppingBag" },
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
          {isSuperAdmin && !collapsed && (
            <div className="mb-4 px-2 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-800">Super Admin</p>
            </div>
          )}
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

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {(isSuperAdmin ? superAdminNavigationItems : navigationItems)?.map((section) => (
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
