import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography, Box, Grid, Alert } from "@mui/material";
import { fetchOrders } from "../../api/restaurantApi";

// Import Widgets and Icons
import KpiCard from "../widgets/KpiCard.jsx";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

const RestaurantManagerDashboard = () => {
  // useQuery takes a unique key and a fetcher function
  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // --- Data Calculation ---
  // We calculate the metrics once the data is available.
  const totalRevenue =
    orders
      ?.reduce((acc, order) => acc + parseFloat(order.total_price), 0)
      .toFixed(2) || 0;
  const totalOrders = orders?.length || 0;
  const deliveredOrders =
    orders?.filter((order) => order.status === "delivered").length || 0;
  const pendingOrders =
    orders?.filter((order) => order.status === "pending").length || 0;

  // Handle error state
  if (isError) {
    return (
      <Alert severity="error">
        Error fetching dashboard data: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Restaurant Dashboard
      </Typography>

      {/* KPI Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Revenue"
            value={`$${totalRevenue}`}
            icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Orders"
            value={totalOrders}
            icon={<ReceiptLongIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Delivered Orders"
            value={deliveredOrders}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Kpi-Card
            title="Pending Orders"
            value={pendingOrders}
            icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="warning.main"
          />
        </Grid>

        {/* --- Add other components like charts or tables here --- */}
        {/* 
                <Grid item xs={12} md={8}>
                    // Chart component for sales over time
                </Grid>
                <Grid item xs={12} md={4}>
                    // Table/List for recent orders
                </Grid>
                */}
      </Grid>
    </Box>
  );
};

export default RestaurantManagerDashboard;
