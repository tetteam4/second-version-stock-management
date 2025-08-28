import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import {
  selectIsAuthenticated,
  selectUser,
} from "../features/auth/authSlice.jsx";
const ProtectedRoute = ({ allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  // 1. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // 2. If authenticated but roles are required and user's role doesn't match
  // Note: Your user object has role as a string: user.role
  const userHasRequiredRole = allowedRoles
    ? allowedRoles.includes(user?.role)
    : true;
  if (!userHasRequiredRole) {
    // Redirect to an 'unauthorized' page or back to the dashboard
    return <Navigate to="/unauthorized" replace />;
  }
  // 3. If authenticated and has the required role (or no role is required)
  return <Outlet />;
};
export default ProtectedRoute;