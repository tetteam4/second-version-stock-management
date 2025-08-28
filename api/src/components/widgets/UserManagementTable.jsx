import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Typography, Button, Tooltip, Alert, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { fetchAllUsers } from "../../api/adminApi";
import { createVendorForUser } from "../../api/vendorApi";

const UserManagementTable = () => {
  const queryClient = useQueryClient();

  const {
    data: allProfiles,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allUsers"], // This key is still valid
    queryFn: fetchAllUsers,
  });

  const createVendorMutation = useMutation({
    mutationFn: createVendorForUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const handleApprove = (userProfile) => {
    const vendorData = {
      // Note: Your VendorRegister view may need user_id or just user.
      // Let's assume it needs the user's UUID.
      user: userProfile.id,
      name: `${userProfile.first_name}'s ${
        userProfile.business_type || "Business"
      }`,
      email: userProfile.email,
    };
    createVendorMutation.mutate(vendorData);
  };

  const columns = [
    { field: "full_name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    {
      field: "business_type",
      headerName: "Business Type",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      renderCell: (params) =>
        params.row.vendor ? (
          <Chip
            icon={<StorefrontIcon />}
            label="Vendor Active"
            color="success"
            size="small"
          />
        ) : (
          <Chip label="Pending Activation" color="warning" size="small" />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Tooltip
          title={
            params.row.vendor
              ? "Vendor account already exists"
              : "Approve user and create vendor account"
          }
        >
          {/* The button is disabled if a vendor already exists */}
          <span>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleApprove(params.row)}
              disabled={createVendorMutation.isPending || !!params.row.vendor}
            >
              Approve
            </Button>
          </span>
        </Tooltip>
      ),
    },
  ];

  if (isError)
    return (
      <Alert severity="error">Could not load users: {error.message}</Alert>
    );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      {createVendorMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not approve user:{" "}
          {JSON.stringify(createVendorMutation.error.response.data)}
        </Alert>
      )}
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={allProfiles || []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id} // Each profile has a unique ID
        />
      </Box>
    </Box>
  );
};

export default UserManagementTable;
