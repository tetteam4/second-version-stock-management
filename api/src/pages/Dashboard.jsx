import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.jsx";
import { Box, CircularProgress, Typography } from "@mui/material";

import AdminDashboard from "../components/dashboard/AdminDashboard.jsx";
import RestaurantManagerDashboard from "../components/dashboard/RestaurantManagerDashboard.jsx";
import ShopManagerDashboard from "../components/dashboard/ShopManagerDashboard.jsx"; // <-- Import the new dashboard
import WaiterDashboard from "../components/dashboard/WaiterDashboard.jsx";

const DefaultDashboard = ({ user }) => (
  <Box>
    <Typography variant="h4">Welcome, {user?.first_name || "User"}!</Typography>
    <Typography>Your dashboard is under construction.</Typography>
  </Box>
);

const DashboardPage = () => {
  const user = useSelector(selectUser);

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const renderDashboard = () => {
    const role = user.role ? user.role.toLowerCase() : "";

    // Priority #1: Admin
    if (role === "admin") {
      return <AdminDashboard />;
    }

    // Priority #2: Business Type
    switch (user.business_type) {
      case "restaurant":
        // Handle roles within the restaurant business
        switch (role) {
          case "manager":
            return <RestaurantManagerDashboard />;
          case "waiter":
            return <WaiterDashboard />;
          default:
            return <DefaultDashboard user={user} />;
        }

      case "shop":
        // Handle roles within the shop business
        switch (role) {
          case "manager":
            return <ShopManagerDashboard />;
          // You could add cases for 'cashier', 'stock_clerk', etc.
          default:
            return <DefaultDashboard user={user} />;
        }

      // Add cases for other business types like 'hospital', 'warehouse', etc.

      default:
        return <DefaultDashboard user={user} />;
    }
  };

  return <>{renderDashboard()}</>;
};

export default DashboardPage;
