import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

import { createCategory, updateCategory } from "../../api/restaurantApi";

const CategoryFormModal = ({ open, onClose, category, categories }) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(category);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: isEditMode ? updateCategory : createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
  });

  useEffect(() => {
    if (isEditMode) {
      reset({ name: category.name });
    } else {
      reset({ name: "" });
    }
  }, [category, isEditMode, reset, open]);

  const onSubmit = (data) => {
    const vendorId = isEditMode
      ? category?.vendor?.id
      : categories?.[0]?.vendor?.id;

    if (!vendorId) {
      console.error(
        "Critical Error: Could not determine Vendor ID from the available data."
      );
      alert(
        "Cannot create a category because the Vendor ID could not be found."
      );
      return;
    }

    // --- FIX ---
    // The key is now "vendor_id" to match what the backend serializer expects.
    const submissionData = { ...data, vendor_id: vendorId };

    if (isEditMode) {
      // For updates, DRF usually expects the main field name, not the '_id' version.
      // We will send both for robustness, but the correct one for PUT is likely 'vendor'.
      mutation.mutate({ id: category.id, ...data, vendor: vendorId });
    } else {
      mutation.mutate(submissionData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Category" : "Create New Category"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error: {JSON.stringify(mutation.error.response.data)}
            </Alert>
          )}
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: "Category name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="Category Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
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

export default CategoryFormModal;
