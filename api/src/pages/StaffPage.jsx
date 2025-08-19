import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { fetchStaffList, deleteStaffMember } from "../api/staffApi";
import StaffFormModal from "../components/modals/StaffFormModal.jsx";

const StaffPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const {
    data: staffList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["staffList"],
    queryFn: fetchStaffList,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const columns = [
    {
      field: "user",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) =>
        `${row.user_details.first_name} ${row.user_details.last_name}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 220,
      valueGetter: (value, row) => row.user_details.email,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 120,
      valueGetter: (value) => value.label, // Role object has key and label
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenModal(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert severity="error">Error fetching staff data: {error.message}</Alert>
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
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenModal()}
        >
          Add Staff
        </Button>
      </Box>
      <Paper sx={{ height: "75vh", width: "100%" }}>
        <DataGrid
          rows={staffList || []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
        />
      </Paper>

      <StaffFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        staffMember={editingStaff}
      />
    </Box>
  );
};

export default StaffPage;
