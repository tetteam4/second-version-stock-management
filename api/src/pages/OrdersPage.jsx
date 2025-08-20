import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Alert, Paper, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import { fetchOrders } from "../api/restaurantApi";
import { getStatusChipColor } from "../utils/helpers"; // We will create this helper
import Chip from "@mui/material/Chip"; // Import Chip directly

const OrdersPage = () => {
  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const columns = [
    { field: "id", headerName: "Order ID", width: 100 },
    { field: "customer", headerName: "Customer", flex: 1, minWidth: 150 },
    {
      field: "status_display",
      headerName: "Status",
      minWidth: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusChipColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: "total_price",
      headerName: "Total",
      type: "number",
      width: 120,
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      field: "items",
      headerName: "Items",
      type: "number",
      width: 100,
      valueGetter: (value) => value.length, // Get the number of items in the order
    },
    {
      field: "created_at",
      headerName: "Date Created",
      flex: 1,
      minWidth: 180,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
    // We can add an 'Actions' column here later for editing or viewing details
  ];

  if (isError) {
    return (
      <Alert severity="error">Error fetching orders: {error.message}</Alert>
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
          Manage Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          // onClick={() => ...} // This would open a "New Order" modal or page
        >
          New Order
        </Button>
      </Box>
      <Paper sx={{ height: "75vh", width: "100%" }}>
        <DataGrid
          rows={orders || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: "created_at", sort: "desc" }],
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default OrdersPage;
