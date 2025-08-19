import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice.jsx";
import { Box, CircularProgress, Typography } from "@mui/material";

// Import the specific dashboard components we are about to create
import AdminDashboard from "../components/dashboard/AdminDashboard.jsx";
import RestaurantManagerDashboard from "../components/dashboard/RestaurantManagerDashboard.jsx";
import WaiterDashboard from "../components/dashboard/WaiterDashboard.jsx";
// Import other dashboards as you create them
// import ChefDashboard from '../components/dashboards/ChefDashboard.jsx';

// A default dashboard for users whose roles don't have a custom view yet
const DefaultDashboard = ({ user }) => (
  <Box>
    <Typography variant="h4">Welcome, {user?.first_name || "User"}!</Typography>
    <Typography>Your dashboard is under construction.</Typography>
  </Box>
);

const DashboardPage = () => {
  const user = useSelector(selectUser);

  // Show a loading spinner if the user object is not yet available
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

  // This is the routing logic to select the correct dashboard
  const renderDashboard = () => {
    const role = user.role; // In your user object, the role is a string like "manager"

    // Handle system-wide roles first
    if (role === "admin") {
      return <AdminDashboard />;
    }

    // Handle business-specific roles
    if (user.business_type === "restaurant") {
      switch (role) {
        case "manager":
          return <RestaurantManagerDashboard />;
        case "waiter":
          return <WaiterDashboard />;
        // case 'chef':
        //     return <ChefDashboard />;
        default:
          return <DefaultDashboard user={user} />;
      }
    }

    // Fallback for any other business type or unhandled role
    return <DefaultDashboard user={user} />;
  };

  return <>{renderDashboard()}</>;
};

export default DashboardPage;
