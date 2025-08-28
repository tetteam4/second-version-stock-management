import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast"; // <-- Import the toast object
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
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
      // --- FIX: Show a success toast ---
      toast.success(
        `Category successfully ${isEditMode ? "updated" : "created"}!`
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (error) => {
      // --- FIX: Show an error toast ---
      const errorMsg =
        error.response?.data?.detail || "An unexpected error occurred.";
      toast.error(`Error: ${errorMsg}`);
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
      toast.error("Could not create category: Vendor ID not found.");
      return;
    }
    const submissionData = { ...data, vendor: vendorId };
    if (isEditMode) {
      mutation.mutate({ id: category.id, ...submissionData });
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
