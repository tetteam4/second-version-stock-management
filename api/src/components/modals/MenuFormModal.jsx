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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  fetchCategories,
  createMenuItem,
  updateMenuItem,
} from "../../api/restaurantApi";
import { selectUser } from "../../features/auth/authSlice";

const MenuFormModal = ({ open, onClose, menuItem }) => {
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const isEditMode = Boolean(menuItem);

  // React Hook Form setup
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch categories for the dropdown select
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: open, // Only fetch when the modal is open
  });

  // Mutation for creating a menu item
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      onClose(); // Close modal on success
    },
  });

  // Mutation for updating a menu item
  const updateMutation = useMutation({
    mutationFn: updateMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      onClose(); // Close modal on success
    },
  });

  // Use useEffect to populate the form when in edit mode
  useEffect(() => {
    if (isEditMode) {
      reset({
        name: menuItem.name,
        category: menuItem.category.id,
        menu_type: menuItem.menu_type,
        menu_value: menuItem.menu_value,
      });
    } else {
      // Reset to default values for a new item
      reset({
        name: "",
        category: "",
        menu_type: "input",
        menu_value: "0.00",
      });
    }
  }, [menuItem, isEditMode, reset, open]);

  const onSubmit = (data) => {
    const vendorId = user?.vendor?.id; // Assuming the vendor info is in the user object
    if (!vendorId) {
      console.error("Vendor ID not found on user object");
      // Here you could set a form error
      return;
    }

    const submissionData = { ...data, vendor: vendorId };

    if (isEditMode) {
      updateMutation.mutate({ id: menuItem.id, ...submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };

  const mutation = isEditMode ? updateMutation : createMutation;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Menu Item" : "Create New Menu Item"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error: {mutation.error.message}
            </Alert>
          )}
          <Controller
            name="name"
            control={control}
            defaultValue=""
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Item Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <FormControl fullWidth margin="normal" error={!!errors.category}>
            <InputLabel>Category</InputLabel>
            <Controller
              name="category"
              control={control}
              defaultValue=""
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
            name="menu_value"
            control={control}
            defaultValue=""
            rules={{ required: "Price/Value is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price or Value"
                fullWidth
                margin="normal"
                error={!!errors.menu_value}
                helperText={
                  errors.menu_value?.message ||
                  "For items with a price, use a number (e.g., 12.99)"
                }
              />
            )}
          />
          {/* Note: menu_type is hardcoded to 'input' for simplicity. You could add a Select for it here if needed. */}
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

export default MenuFormModal;
