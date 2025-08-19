import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "@mui/material";

import { createCategory, updateCategory } from "../../api/restaurantApi";
import { selectUser } from "../../features/auth/authSlice";

const CategoryFormModal = ({ open, onClose, category }) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(category);
  const user = useSelector(selectUser);
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
    const vendorId = user?.vendor?.id;

    if (!vendorId) {
      console.error(
        "Critical Error: Vendor ID is not available for the current user in Redux."
      );
      alert(
        "Cannot create category: Vendor ID not found in your user profile."
      );
      return;
    }

    if (isEditMode) {
      // For updates, DRF usually expects the field name for the relation.
      const submissionData = { ...data, vendor: vendorId };
      mutation.mutate({ id: category.id, ...submissionData });
    } else {
      // --- FIX ---
      // For creation, the backend error explicitly asks for "vendor_id".
      const submissionData = { ...data, vendor_id: vendorId };
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
