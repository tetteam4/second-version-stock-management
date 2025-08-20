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
      headerName: "Value / Price",
      flex: 1.5,
      minWidth: 180,
      valueFormatter: (value) => {
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "boolean") return value ? "Active" : "Inactive";
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
        <DataGrid rows={menus || []} columns={columns} loading={isLoading} />
      </Paper>

      <MenuFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        menuItem={editingMenuItem}
      />
    </Box>
  );
};

export default MenuPage;
