import React, { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Typography, Box, Grid, Alert } from "@mui/material";
import {
  fetchAllUsers,
  fetchAllVendors,
  fetchAllProducts,
  fetchAllSales,
} from "../../api/adminApi.js";

import KpiCard from "../widgets/KpiCard.jsx";
import UserRegistrationsChart from "../widgets/UserRegistrationsChart.jsx";
import UserManagementTable from "../widgets/UserManagementTable.jsx";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import InventoryIcon from "@mui/icons-material/Inventory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const AdminDashboard = () => {
  const results = useQueries({
    queries: [
      { queryKey: ["allUsers"], queryFn: fetchAllUsers },
      { queryKey: ["allVendors"], queryFn: fetchAllVendors },
      { queryKey: ["allProducts"], queryFn: fetchAllProducts },
      { queryKey: ["allSales"], queryFn: fetchAllSales },
    ],
  });

  const [usersResult, vendorsResult, productsResult, salesResult] = results;
  const allUsers = usersResult.data || [];
  const allVendors = vendorsResult.data || [];
  const allProducts = productsResult.data || [];
  const allSales = salesResult.data || [];

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  const totalUsers = allUsers.length;
  const totalVendors = allVendors.length;
  const totalProducts = allProducts.length;
  const totalRevenue = allSales
    .reduce((acc, sale) => acc + parseFloat(sale.total_revenue || 0), 0)
    .toFixed(2);

  const userChartData = useMemo(() => {
    if (!allUsers || allUsers.length === 0) return [];
    const usersByDate = allUsers.reduce((acc, profile) => {
      const date = new Date(
        profile.created_at || Date.now()
      ).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    return Object.keys(usersByDate)
      .map((date) => ({ date: date, users: usersByDate[date] }))
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
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Users"
            value={totalUsers}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Vendors"
            value={totalVendors}
            icon={<StoreIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Products"
            value={totalProducts}
            icon={<InventoryIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Revenue"
            value={`$${totalRevenue}`}
            icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="success.main"
          />
        </Grid>

        <Grid xs={12}>
          <UserRegistrationsChart data={userChartData} />
        </Grid>

        <Grid xs={12}>
          <UserManagementTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
