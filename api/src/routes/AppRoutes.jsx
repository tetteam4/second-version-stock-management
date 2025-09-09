import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import ProtectedRoute from "./protectedRoutes.jsx";

// Page Imports
import LoginPage from "../pages/LoginPage.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import InventoryPage from "../pages/InventoryPage.jsx";
import StaffPage from "../pages/StaffPage.jsx";
import MenuPage from "../pages/MenuPage.jsx";
import DashboardPage from "../pages/Dashboard.jsx";
import CategoryPage from "../pages/CategoryPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ProductPage from "../pages/ProductPage.jsx"; 
import ProfilePage from "../pages/ProfilePage.jsx";
// Placeholder and Helper Pages
const AdminSettingsPage = () => <h2>Admin Settings Page</h2>;
const WelcomePage = () => <h2>Welcome to the ERP</h2>;
const UnauthorizedPage = () => (
  <h2>You are not authorized to view this page.</h2>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Redirect from root to welcome page */}
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* This nested route correctly creates the full path "/admin/settings" */}
          <Route
            path="admin"
            element={<ProtectedRoute allowedRoles={["admin"]} />}
          >
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default AppRoutes;
