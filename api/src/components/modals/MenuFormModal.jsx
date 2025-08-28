import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
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
  Box,
  Typography,
  Grid,
  Avatar,
  IconButton,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  createMenuItem,
  updateMenuItem,
  fetchCategories,
} from "../../api/restaurantApi";
import { selectUser } from "../../features/auth/authSlice";

const menuTypes = ["input", "dropdown", "checkbox"];

const MenuFormModal = ({ open, onClose, menuItem }) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(menuItem);
  const user = useSelector(selectUser);

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
      menu_value_kv: [{ key: "", value: "" }], 
      menu_value_text: "", 
      menu_value_bool: false, 
    },
  });

  // useFieldArray manages the dynamic key-value pairs
  const { fields, append, remove } = useFieldArray({
    control,
    name: "menu_value_kv",
  });

  const selectedMenuType = useWatch({ control, name: "menu_type" });
  const [keptImageIds, setKeptImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);

     const { data: categories, isLoading: isLoadingCategories } = useQuery({
       queryKey: ["categories"],
       queryFn: fetchCategories,
       enabled: open && !!user?.vendor?.id, 
       select: (allCategories) => {
         if (!user?.vendor?.id) return []; 
         return allCategories.filter(
           (category) => category.vendor === user.vendor.id
         );
       },
     });

  const mutation = useMutation({
    mutationFn: isEditMode ? updateMenuItem : createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      onClose();
      toast.success(
        `Menu item successfully ${isEditMode ? "updated" : "created"}.`
      );
    },
    onError: (error) =>
      toast.error(`Error: ${JSON.stringify(error.response.data)}`),
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && menuItem) {
        let kv = [{ key: "", value: "" }];
        let text = "";
        let bool = false;

        if (
          menuItem.menu_type === "input" &&
          typeof menuItem.menu_value === "object" &&
          !Array.isArray(menuItem.menu_value)
        ) {
          kv = Object.entries(menuItem.menu_value).map(([key, value]) => ({
            key,
            value,
          })) || [{ key: "", value: "" }];
        } else if (
          menuItem.menu_type === "dropdown" &&
          Array.isArray(menuItem.menu_value)
        ) {
          text = menuItem.menu_value.join(", ");
        } else if (menuItem.menu_type === "checkbox") {
          bool = !!menuItem.menu_value;
        }

        reset({
          name: menuItem.name,
          category: menuItem.category,
          menu_type: menuItem.menu_type,
          menu_value_kv: kv,
          menu_value_text: text,
          menu_value_bool: bool,
        });
        setKeptImageIds(menuItem.images.map((img) => img.id));
      } else {
        reset({
          name: "",
          category: "",
          menu_type: "input",
          menu_value_kv: [{ key: "", value: "" }],
          menu_value_text: "",
          menu_value_bool: false,
        });
        setKeptImageIds([]);
      }
      setNewImages([]);
    }
  }, [menuItem, isEditMode, reset, open]);

  const handleFileChange = (event) => {
    if (event.target.files) {
      setNewImages(Array.from(event.target.files));
    }
  };

  const handleToggleKeptImage = (id) => {
    setKeptImageIds((prev) =>
      prev.includes(id) ? prev.filter((keptId) => keptId !== id) : [...prev, id]
    );
  };

  const onSubmit = (data) => {
    const vendorId = user?.vendor?.id;
    if (!vendorId) {
      toast.error("Error: Could not find Vendor ID.");
      return;
    }

    let finalMenuValue;
    switch (data.menu_type) {
      case "dropdown":
        finalMenuValue = JSON.stringify(
          data.menu_value_text
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        );
        break;
      case "checkbox":
        finalMenuValue = JSON.stringify(!!data.menu_value_bool);
        break;
      case "input":
      default:
        const jsonObject = data.menu_value_kv.reduce((acc, curr) => {
          if (curr.key) {
            acc[curr.key] = curr.value;
          }
          return acc;
        }, {});
        finalMenuValue = JSON.stringify(jsonObject);
        break;
    }

    const submissionData = {
      name: data.name,
      category: data.category,
      menu_type: data.menu_type,
      menu_value: finalMenuValue,
      vendor: vendorId,
      uploaded_images: newImages,
    };

    if (isEditMode) {
      submissionData.kept_image_ids = keptImageIds;
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
            name="menu_value_text"
            control={control}
            rules={{ required: "Values are required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dropdown Values (comma-separated)"
                fullWidth
                margin="normal"
                error={!!errors.menu_value_text}
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
                name="menu_value_bool"
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
          <Box sx={{ width: "100%", mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key-Value Pairs
            </Typography>
            {fields.map((field, index) => (
              <Grid
                container
                spacing={1}
                key={field.id}
                sx={{ alignItems: "center", mb: 1 }}
              >
                <Grid item xs={5}>
                  <Controller
                    name={`menu_value_kv.${index}.key`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Key"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Controller
                    name={`menu_value_kv.${index}.value`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Value"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => remove(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              type="button"
              startIcon={<AddCircleIcon />}
              onClick={() => append({ key: "", value: "" })}
              size="small"
            >
              Add Field
            </Button>
          </Box>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
          </Grid>

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

          <Typography sx={{ mt: 2, mb: 1 }}>Upload Images</Typography>
          <Button variant="contained" component="label">
            Select Files
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
          <Typography variant="caption" display="block">
            {newImages.length} new file(s) selected.
          </Typography>

          {isEditMode && menuItem?.images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography>
                Manage Existing Images (Uncheck to delete)
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {menuItem.images.map((image) => (
                  <Grid item key={image.id}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        variant="rounded"
                        src={image.image}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Checkbox
                        checked={keptImageIds.includes(image.id)}
                        onChange={() => handleToggleKeptImage(image.id)}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          backgroundColor: "rgba(255,255,255,0.7)",
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
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
