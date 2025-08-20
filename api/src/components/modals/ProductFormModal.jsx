import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { createProduct, updateProduct } from "../../api/inventoryApi";
import { fetchCategories } from "../../api/restaurantApi"; // Categories are used for products too
import { selectUser } from "../../features/auth/authSlice";

const ProductFormModal = ({ open, onClose, product }) => {
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const isEditMode = Boolean(product);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tool: "",
      category: "",
      description: "",
      attributes: "{}",
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: isEditMode ? updateProduct : createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
  });

  useEffect(() => {
    if (isEditMode) {
      reset({
        tool: product.tool,
        category: product.category, // Assuming category is just an ID
        description: product.description,
        attributes: JSON.stringify(product.attributes, null, 2), // Format JSON for readability
      });
    } else {
      reset({ tool: "", category: "", description: "", attributes: "{}" });
    }
  }, [product, isEditMode, reset, open]);

  const onSubmit = (data) => {
    const vendorId = user?.vendor?.id;
    if (!vendorId) {
      alert("Error: Could not find Vendor ID for the current user.");
      return;
    }

    try {
      // Ensure attributes are valid JSON before submitting
      const attributes = JSON.parse(data.attributes);
      const submissionData = { ...data, attributes, vendor: vendorId };

      if (isEditMode) {
        mutation.mutate({ id: product.id, ...submissionData });
      } else {
        mutation.mutate(submissionData);
      }
    } catch (e) {
      alert("Invalid JSON in Attributes field. Please correct it.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Product" : "Create New Product"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error: {JSON.stringify(mutation.error.response.data)}
            </Alert>
          )}
          <Controller
            name="tool"
            control={control}
            rules={{ required: "Product name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="Product Name"
                fullWidth
                margin="normal"
                error={!!errors.tool}
                helperText={errors.tool?.message}
              />
            )}
          />
          <FormControl fullWidth margin="normal" error={!!errors.category}>
            <InputLabel>Category</InputLabel>
            <Controller
              name="category"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Category"
                  disabled={isLoadingCategories}
                >
                  {categories?.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.category && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  margin: "3px 14px 0",
                }}
              >
                {errors.category.message}
              </p>
            )}
          </FormControl>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            )}
          />
          <Controller
            name="attributes"
            control={control}
            rules={{ required: "Attributes (as JSON) are required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Attributes (JSON format)"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                error={!!errors.attributes}
                helperText={errors.attributes?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormModal;
