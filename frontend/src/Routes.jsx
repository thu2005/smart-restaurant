import React from "react";
import {
  BrowserRouter,
  Routes as RouterRoutes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "components/ProtectedRoute";
import authService from "services/authService";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import KitchenLayout from "./layouts/KitchenLayout";

// Pages
import ShoppingCart from "./pages/customer/shopping-cart";
import MenuBrowse from "./pages/customer/menu-browse";
import MenuItemDetail from "./pages/customer/menu-item-detail";
import OrderStatusTracking from "./pages/customer/order-status-tracking";

import AdminDashboard from "./pages/admin/dashboard";
import KitchenDashboard from "./pages/kitchen/dashboard";
import Login from "./pages/auth/Login";

// Admin Menu Management Pages
import CategoryList from "./pages/admin/menu/categories/CategoryList";
import MenuItemList from "./pages/admin/menu/items/MenuItemList";
import ModifierList from "./pages/admin/menu/modifiers/ModifierList";
import TableManagement from "./pages/admin/tables/TableList";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Root redirect */}
          <Route
            path="/"
            element={
              authService.isAuthenticated()
                ? <Navigate to="/admin/menu/items" replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/menu-browse" replace />} />
            <Route path="menu-browse" element={<MenuBrowse />} />
            <Route path="shopping-cart" element={<ShoppingCart />} />
            <Route path="menu-item-detail" element={<MenuItemDetail />} />
            <Route
              path="order-status-tracking"
              element={<OrderStatusTracking />}
            />
          </Route>

          {/* Admin Routes - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/menu/items" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Menu Management Routes */}
            <Route path="menu/categories" element={<CategoryList />} />
            <Route path="menu/items" element={<MenuItemList />} />
            <Route path="menu/modifiers" element={<ModifierList />} />
            <Route path="tables" element={<TableManagement />} />
          </Route>
          {/* Legacy redirect */}
          <Route
            path="/admin-dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* Kitchen Routes - Protected */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute>
                <KitchenLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<KitchenDashboard />} />
          </Route>
          {/* Legacy redirect */}
          <Route
            path="/kitchen-display-system"
            element={<Navigate to="/kitchen/dashboard" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
