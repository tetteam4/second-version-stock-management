import React, { useMemo } from "react"; // <-- Import useMemo
import { useQuery } from "@tanstack/react-query";
import { Typography, Box, Grid, Alert } from "@mui/material";
import { fetchOrders } from "../../api/restaurantApi";

// Import Widgets and Icons
import KpiCard from "../widgets/KpiCard.jsx";
import RecentOrdersTable from "../widgets/RecentOrdersTable.jsx";
import SalesChart from "../widgets/SalesChart.jsx"; //
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

const RestaurantManagerDashboard = () => {
  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // --- Data Calculation for KPIs ---
  const totalRevenue =
    orders
      ?.reduce((acc, order) => acc + parseFloat(order.total_price), 0)
      .toFixed(2) || 0;
  const totalOrders = orders?.length || 0;
  const deliveredOrders =
    orders?.filter((order) => order.status === "delivered").length || 0;
  const pendingOrders =
    orders?.filter((order) => order.status === "pending").length || 0;

  // --- Data Transformation for the Chart using useMemo ---
  const chartData = useMemo(() => {
    if (!orders) return [];

    // Group orders by date and sum their total_price
    const salesByDate = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString(); // "8/20/2025"
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(order.total_price);
      return acc;
    }, {});

    // Convert the grouped data into an array of objects that Recharts can use and sort by date
    return Object.keys(salesByDate)
      .map((date) => ({
        date: date,
        sales: salesByDate[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [orders]); // This calculation only re-runs when 'orders' data changes

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

      <Grid container spacing={3}>
        {/* KPI Grid */}
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
          <KpiCard
            title="Pending Orders"
            value={pendingOrders}
            icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="warning.main"
          />
        </Grid>

        {/* --- Sales Chart --- */}
        <Grid item xs={12}>
          <SalesChart data={chartData} />
        </Grid>

        {/* --- Recent Orders Table --- */}
        <Grid item xs={12}>
          <RecentOrdersTable data={orders} isLoading={isLoading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantManagerDashboard;
