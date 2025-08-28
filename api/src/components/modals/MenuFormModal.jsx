import React, { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  createMenuItem,
  updateMenuItem,
  fetchCategories,
} from "../../api/restaurantApi";
import { selectUser } from "../../features/auth/authSlice";

const menuTypes = ["input", "dropdown", "checkbox"];

const MenuFormModal = ({ open, onClose, menuItem }) => {
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const isEditMode = Boolean(menuItem);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      menu_type: "input",
      menu_value: "",
    },
  });
  const selectedMenuType = useWatch({ control, name: "menu_type" });
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: open,
  });
  const mutation = useMutation({
    mutationFn: isEditMode ? updateMenuItem : createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        let formattedValue = menuItem.menu_value;
        if (Array.isArray(formattedValue)) {
          formattedValue = formattedValue.join(", ");
        }
        reset({
          name: menuItem.name,
          category: menuItem.category,
          menu_type: menuItem.menu_type,
          menu_value: String(formattedValue),
        });
      } else {
        reset({ name: "", category: "", menu_type: "input", menu_value: "" });
      }
    }
  }, [menuItem, isEditMode, reset, open]);

  const onSubmit = (data) => {
    const vendorId = user?.vendor?.id;
    if (!vendorId) {
      alert("Error: Could not find Vendor ID for the current user.");
      return;
    }
    let finalMenuValue;
    switch (data.menu_type) {
      case "dropdown":
        finalMenuValue = data.menu_value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      case "checkbox":
        finalMenuValue = data.menu_value; // Already a boolean from the form
        break;
      case "input":
      default:
        finalMenuValue = data.menu_value;
        break;
    }
    const submissionData = {
      ...data,
      menu_value: finalMenuValue,
      vendor: vendorId,
    };
    if (isEditMode) {
      mutation.mutate({ id: menuItem.id, ...submissionData });
    } else {
      mutation.mutate(submissionData);
    }
  };

  const renderMenuValueInput = () => {
    switch (selectedMenuType) {
      case "dropdown":
        return (
          <Controller
            name="menu_value"
            control={control}
            rules={{ required: "Values are required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dropdown Values (comma-separated)"
                fullWidth
                margin="normal"
                error={!!errors.menu_value}
                helperText="e.g., Small, Medium, Large"
              />
            )}
          />
        );
      case "checkbox":
        return (
          <FormControlLabel
            control={
              <Controller
                name="menu_value"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Checkbox {...field} checked={!!field.value} />
                )}
              />
            }
            label="Is this option active?"
          />
        );
      case "input":
      default:
        return (
          <Controller
            name="menu_value"
            control={control}
            rules={{ required: "Price is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price"
                type="number"
                step="0.01"
                fullWidth
                margin="normal"
                error={!!errors.menu_value}
                helperText="e.g., 12.99"
              />
            )}
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Menu Item" : "Create New Menu Item"}
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
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Menu Item Name"
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
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!errors.menu_type}>
            <InputLabel>Menu Type</InputLabel>
            <Controller
              name="menu_type"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Menu Type">
                  {menuTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          {renderMenuValueInput()}
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
