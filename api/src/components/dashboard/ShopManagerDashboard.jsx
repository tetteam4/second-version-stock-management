import React from "react";
import { useQueries } from "@tanstack/react-query";
import { Typography, Box, Grid, Alert } from "@mui/material";

// We can reuse the API functions from our inventoryApi
import {
  fetchProducts,
  fetchStockList,
  fetchWarehouses,
} from "../../api/inventoryApi.js";
import { fetchAllSales } from "../../api/adminApi.js"; // Sales are system-wide for now

import KpiCard from "../widgets/KpiCard.jsx";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import WarningIcon from "@mui/icons-material/Warning";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const ShopManagerDashboard = () => {
  const results = useQueries({
    queries: [
      { queryKey: ["products"], queryFn: fetchProducts },
      { queryKey: ["stockList"], queryFn: fetchStockList },
      { queryKey: ["warehouses"], queryFn: fetchWarehouses },
      { queryKey: ["allSales"], queryFn: fetchAllSales },
    ],
  });

  const [productsResult, stockListResult, warehousesResult, salesResult] =
    results;

  const isLoading = results.some((q) => q.isLoading);
  const isError = results.some((q) => q.isError);
  const error = results.find((q) => q.isError)?.error;

  // --- KPI Calculations ---
  const totalProducts = productsResult.data?.length || 0;
  const totalWarehouses = warehousesResult.data?.length || 0;
  const lowStockItems =
    stockListResult.data?.filter((item) => item.quantity < 10).length || 0;
  const totalRevenue = salesResult.data
    ?.reduce((acc, sale) => acc + parseFloat(sale.total_revenue || 0), 0)
    .toFixed(2);

  if (isError) {
    return (
      <Alert severity="error">Error fetching shop data: {error.message}</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shop Manager Dashboard
      </Typography>

      <Grid container spacing={3}>
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
            title="Warehouses"
            value={totalWarehouses}
            icon={<WarehouseIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Low Stock Items"
            value={lowStockItems}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Sales Revenue"
            value={`$${totalRevenue}`}
            icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
            isLoading={isLoading}
            color="success.main"
          />
        </Grid>

        {/* We can add a "Top Selling Products" chart or a "Recent Sales" table here later */}
      </Grid>
    </Box>
  );
};

export default ShopManagerDashboard;
