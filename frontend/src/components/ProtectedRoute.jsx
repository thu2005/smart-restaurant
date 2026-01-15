import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, roles = null, redirectTo = '/login' }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const roleRedirects = {
        ADMIN: '/admin/dashboard',
        WAITER: '/waiter',
        KITCHEN: '/kitchen/dashboard',
        CUSTOMER: '/customer/menu-browse',
      };
      const userRedirect = roleRedirects[user?.role] || '/login';
      return <Navigate to={userRedirect} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
