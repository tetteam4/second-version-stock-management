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

import { fetchMenus, deleteMenuItem } from "../api/restaurantApi";
// We will create this Modal component in the next step
// import MenuFormModal from '../components/modals/MenuFormModal';

const MenuPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const {
    data: menus,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["menus"],
    queryFn: fetchMenus,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      // Invalidate and refetch the menus query to update the table
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenModal = (menuItem = null) => {
    setEditingMenuItem(menuItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenuItem(null);
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 150,
      // The category object is nested, so we use valueGetter
      valueGetter: (value) => value?.name || "N/A",
    },
    { field: "menu_type", headerName: "Type", flex: 0.5, minWidth: 100 },
    {
      field: "menu_value",
      headerName: "Value / Price",
      flex: 1,
      minWidth: 120,
      // The value can be a string, number, or array, so we format it
      valueFormatter: (value) => {
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null)
          return JSON.stringify(value);
        return value;
      },
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
      <Alert severity="error">Error fetching menu data: {error.message}</Alert>
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
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenModal()}
        >
          New Menu Item
        </Button>
      </Box>
      <Paper sx={{ height: "75vh", width: "100%" }}>
        <DataGrid
          rows={menus || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>

      {/*
            <MenuFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                menuItem={editingMenuItem}
            />
            */}
    </Box>
  );
};

export default MenuPage;
