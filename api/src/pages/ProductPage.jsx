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

import { fetchProducts, deleteProduct } from "../api/inventoryApi";
import ProductFormModal from "../components/modals/ProductFormModal.jsx";

const ProductPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const columns = [
    { field: "sku", headerName: "SKU", width: 150 },
    { field: "tool", headerName: "Product Name", flex: 1, minWidth: 180 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => row.category_details?.name || "N/A", // Assuming backend sends category_details
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
      <Alert severity="error">Error fetching products: {error.message}</Alert>
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
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenModal()}
        >
          New Product
        </Button>
      </Box>
      <Paper sx={{ height: "75vh", width: "100%" }}>
        <DataGrid
          rows={products || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>

      <ProductFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
      />
    </Box>
  );
};

export default ProductPage;
