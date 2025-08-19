import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Button, Paper, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import { fetchStockList } from "../api/inventoryApi";

const InventoryPage = () => {
  const {
    data: stockList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stockList"],
    queryFn: fetchStockList,
  });

  const columns = [
    {
      field: "id",
      headerName: "Stock ID",
      width: 100,
    },
    {
      field: "product_name",
      headerName: "Product",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) => row.product?.tool || "N/A",
    },
    {
      field: "warehouse_name",
      headerName: "Warehouse",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => row.warehouse?.name || "N/A",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      width: 120,
      cellClassName: (params) => {
        // Check that the value is a number before comparing
        if (typeof params.value === "number" && params.value < 10) {
          return "low-stock";
        }
        return "";
      },
    },
    {
      field: "purchase_price_per_unit",
      headerName: "Purchase Price",
      type: "number",
      width: 150,
      valueFormatter: (value) =>
        value != null ? `$${Number(value).toFixed(2)}` : "",
    },
  ];

  if (isError) {
    return (
      <Alert severity="error">
        Error fetching inventory data: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Inventory Stock
        </Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />}>
          Add New Stock
        </Button>
      </Box>

      <Paper
        sx={{
          height: "75vh",
          width: "100%",
          "& .low-stock": {
            color: "#d32f2f", // A specific, strong red color
            fontWeight: "bold",
          },
        }}
      >
        <DataGrid
          rows={stockList || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
};

export default InventoryPage;
