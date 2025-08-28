import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getStatusChipColor } from "../../utils/helpers";

const RecentOrdersTable = ({ data, isLoading }) => {
  // Define the columns for the DataGrid
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
    },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status_display",
      headerName: "Status",
      minWidth: 120,
      flex: 0.5,
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
      minWidth: 100,
      flex: 0.5,
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      field: "created_at",
      headerName: "Date",
      minWidth: 180,
      flex: 1,
      valueFormatter: (value) => new Date(value).toLocaleString(),
    },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Recent Orders
      </Typography>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={data || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
            sorting: {
              sortModel: [{ field: "created_at", sort: "desc" }],
            },
          }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default RecentOrdersTable;
