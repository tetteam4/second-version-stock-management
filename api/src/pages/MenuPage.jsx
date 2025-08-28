import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { fetchMenus, deleteMenuItem } from "../api/restaurantApi";
import MenuFormModal from "../components/modals/MenuFormModal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";

const MenuPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      // You should add toast notifications here for better UX
    },
  });

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(itemToDelete);
    setConfirmOpen(false);
    setItemToDelete(null);
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
      valueGetter: (value, row) => row.category?.name || "N/A",
    },
    {
      field: "menu_type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => <Chip label={params.value} size="small" />,
    },
    {
      field: "menu_value",
      headerName: "Value / Details",
      flex: 1.5,
      minWidth: 200,
      // --- FIX: This valueFormatter is now smarter ---
      valueFormatter: (value) => {
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        if (typeof value === "boolean") {
          return value ? "Active" : "Inactive";
        }
        // If it's an object (but not an array or null), format it nicely.
        if (typeof value === "object" && value !== null) {
          return Object.entries(value)
            .map(([key, val]) => `${key}: ${val}`)
            .join(" | "); // e.g., "price: 15.99 | SKU: 123"
        }
        // Otherwise, just return the value as is.
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
            onClick={() => handleDeleteClick(params.row.id)}
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
        <DataGrid rows={menus || []} columns={columns} loading={isLoading} />
      </Paper>

      <MenuFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        menuItem={editingMenuItem}
      />

      {/* Added the confirmation dialog for deletions */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Menu Item?"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </Box>
  );
};

export default MenuPage;
