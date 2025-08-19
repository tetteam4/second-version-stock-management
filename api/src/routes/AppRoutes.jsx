import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import ProtectedRoute from "./protectedRoutes.jsx";

// Page Imports
import LoginPage from "../pages/LoginPage.jsx";
import DashboardPage from "../pages/Dashboard.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import MenuPage from "../pages/MenuPage.jsx";

// --- Create Simple Placeholder Components for Unfinished Pages ---
// const MenuPage = () => <h2>Menu Management Page</h2>;
const InventoryPage = () => <h2>Inventory Page</h2>;
const StaffPage = () => <h2>Staff Management Page</h2>;
const AdminSettingsPage = () => <h2>Admin Settings Page</h2>;

// --- Public Helper Pages ---
const WelcomePage = () => <h2>Welcome to the ERP</h2>;
const UnauthorizedPage = () => (
  <h2>You are not authorized to view this page.</h2>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================================== */}
      {/* PUBLIC ROUTES                          */}
      {/* These routes are accessible to anyone. */}
      {/* ======================================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ======================================== */}
      {/* PROTECTED ROUTES                       */}
      {/* These routes require authentication.   */}
      {/* ======================================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* Default route inside the layout redirects to the dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Main Feature Routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="staff" element={<StaffPage />} />

          {/* This route has an additional layer of role protection */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* ======================================== */}
      {/* FALLBACK ROUTE                         */}
      {/* Redirects any unknown URL to a safe page.*/}
      {/* ======================================== */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default AppRoutes;
