import React, { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Typography, Box, Grid, Alert } from "@mui/material";
import {
  fetchAllUsers,
  fetchAllVendors,
  fetchAllProducts,
  fetchAllSales,
} from "../../api/adminApi.js";

// Import Widgets and Icons
import KpiCard from "../widgets/KpiCard.jsx";
import UserRegistrationsChart from "../widgets/UserRegistrationsChart.jsx";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import InventoryIcon from "@mui/icons-material/Inventory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const AdminDashboard = () => {
  // useQueries allows us to fetch multiple data sources in parallel
  const results = useQueries({
    queries: [
      { queryKey: ["allUsers"], queryFn: fetchAllUsers },
      { queryKey: ["allVendors"], queryFn: fetchAllVendors },
      { queryKey: ["allProducts"], queryFn: fetchAllProducts },
      { queryKey: ["allSales"], queryFn: fetchAllSales },
    ],
  });

  // Destructure the results for easier access
  const [usersResult, vendorsResult, productsResult, salesResult] = results;
  const { data: allUsers } = usersResult;
  const { data: allVendors } = vendorsResult;
  const { data: allProducts } = productsResult;
  const { data: allSales } = salesResult;

  // Determine the overall loading and error states
  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  // --- KPI Calculations ---
  const totalUsers = allUsers?.length || 0;
  const totalVendors = allVendors?.length || 0;
  const totalProducts = allProducts?.length || 0;
  const totalRevenue =
    allSales
      ?.reduce((acc, sale) => acc + parseFloat(sale.total_revenue), 0)
      .toFixed(2) || 0;

  // --- Data Transformation for User Chart ---
  const userChartData = useMemo(() => {
    if (!allUsers) return [];

    // This relies on the 'date_joined' field from your User model.
    // If it's not being sent by the serializer, this will group by 'Unknown Date'.
    const usersByDate = allUsers.reduce((acc, user) => {
      const date = user.date_joined
        ? new Date(user.date_joined).toLocaleString()
        : "Unknown Date";
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    return Object.keys(usersByDate)
      .map((date) => ({
        date: date,
        users: usersByDate[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allUsers]);

  if (isError) {
    return (
      <Alert severity="error">Error fetching admin data: {error.message}</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Administrator Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* KPI Widgets */}
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Users"
            value={totalUsers}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Vendors"
            value={totalVendors}
            icon={<StoreIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Products"
            value={totalProducts}
            icon={<InventoryIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Revenue"
            value={`$${totalRevenue}`}
            icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="success.main"
          />
        </Grid>

        {/* Chart Widget */}
        <Grid item xs={12}>
          <UserRegistrationsChart data={userChartData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
