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

import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";
import KitchenLayout from "./layouts/KitchenLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

// Pages
import ShoppingCart from "./pages/customer/shopping-cart";
import MenuBrowse from "./pages/customer/menu-browse";
import MenuItemDetail from "./pages/customer/menu-item-detail";
import OrderStatusTracking from "./pages/customer/order-status-tracking";
import Profile from "./pages/customer/profile";
import PaymentResult from "./pages/customer/payment/result";

import AdminDashboard from "./pages/admin/dashboard";
import KitchenDashboard from "./pages/kitchen/dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/customer/Onboarding";
import TableEntry from "./pages/customer/TableEntry";
import QREntry from "./pages/customer/QREntry";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin Menu Management Pages
import CategoryList from "./pages/admin/menu/categories/CategoryList";
import MenuItemList from "./pages/admin/menu/items/MenuItemList";
import ModifierList from "./pages/admin/menu/modifiers/ModifierList";
import TableManagement from "./pages/admin/tables/TableList";
import OrderList from "./pages/admin/orders/OrderList";
import Reports from "./pages/admin/reports";
import MetabaseDashboard from "./pages/admin/reports/MetabaseDashboard";

// User Management Pages
import UserManagement from "./pages/admin/users/UserManagement";
import CreateUser from "./pages/admin/users/CreateUser";
import EditUser from "./pages/admin/users/EditUser";
import Settings from "./pages/admin/settings";

// Waiter Pages
import WaiterDashboard from "./pages/waiter";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* QR Entry Route - New format with restaurantId and tableId */}
          <Route path="/qr/:restaurantId/:tableId" element={<QREntry />} />

          {/* Table Entry Route - Legacy format (kept for backward compatibility) */}
          <Route path="/table/:tableId" element={<TableEntry />} />

          {/* Root redirect */}
          <Route
            path="/"
            element={
              authService.isAuthenticated() ? (
                authService.getCurrentUser()?.role === "SUPER_ADMIN" ? (
                  <Navigate to="/superadmin/users" replace />
                ) : (
                  <Navigate to="/admin/menu/items" replace />
                )
              ) : (
                <Onboarding />
              )
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dedicated Customer Onboarding Route - for QR scans */}
          <Route path="/customer-onboarding" element={<Onboarding />} />

          {/* Super Admin Routes - Protected */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute roles={['SUPER_ADMIN']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/superadmin/users" replace />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/:id/edit" element={<EditUser />} />
          </Route>

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <CustomerAuthProvider>
                <CustomerLayout />
              </CustomerAuthProvider>
            }
          >
            <Route
              index
              element={<Navigate to="/customer/menu-browse" replace />}
            />
            <Route path="menu-browse" element={<MenuBrowse />} />
            <Route
              path="menu-browse/:restaurantId/:tableNumber"
              element={<MenuBrowse />}
            />
            <Route path="shopping-cart" element={<ShoppingCart />} />
            <Route
              path="menu-item-detail/:itemId"
              element={<MenuItemDetail />}
            />
            <Route
              path="order-status-tracking"
              element={<OrderStatusTracking />}
            />
            <Route path="profile" element={<Profile />} />
            <Route path="payment/result" element={<PaymentResult />} />
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
            <Route
              index
              element={
                <Navigate
                  to={authService.getCurrentUser()?.role === "SUPER_ADMIN" ? "/admin/users" : "/admin/menu/items"}
                  replace
                />
              }
            />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Kitchen Display for Admin - with sidebar */}
            <Route path="kitchen/dashboard" element={<KitchenDashboard />} />

            {/* Menu Management Routes */}
            <Route path="menu/categories" element={<CategoryList />} />
            <Route path="menu/items" element={<MenuItemList />} />
            <Route path="menu/modifiers" element={<ModifierList />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<MetabaseDashboard />} />

            {/* User Management Routes */}
            <Route path="users" element={<UserManagement />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/:id/edit" element={<EditUser />} />
            <Route path="settings" element={<Settings />} />
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

          {/* Waiter Routes - Protected */}
          <Route
            path="/waiter"
            element={
              <ProtectedRoute roles={['WAITER']}>
                <WaiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
