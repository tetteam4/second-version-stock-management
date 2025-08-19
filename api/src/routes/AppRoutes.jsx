import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import ProtectedRoute from "./protectedRoutes.jsx";

// Page Imports
import LoginPage from "../pages/LoginPage.jsx";
import DashboardPage from "../pages/Dashboard.jsx"; // We will create this next

// A simple component for a public page like a landing page
const WelcomePage = () => <h2>Welcome to the ERP</h2>;

// A simple component for unauthorized access
const UnauthorizedPage = () => (
  <h2>You are not authorized to view this page.</h2>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 
        This is the main protected route group. 
        All routes nested inside will first check for authentication.
      */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* The default route inside the layout redirects to the dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* 
            Add other role-protected routes here. For example, only for managers.
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                <Route path="admin-settings" element={<AdminSettingsPage />} />
            </Route>
          */}
        </Route>
      </Route>

      {/* Fallback Route: If no other route matches, redirect to the welcome page */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default AppRoutes;
