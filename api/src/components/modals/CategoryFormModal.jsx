import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Box,
  IconButton,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { createCategory, updateCategory } from "../../api/restaurantApi";
import { selectUser } from "../../features/auth/authSlice";

const CategoryFormModal = ({ open, onClose, category }) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(category);
  const user = useSelector(selectUser);
  const { handleSubmit, control, reset, setValue } = useForm();

  const [keptImageIds, setKeptImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    if (open) {
      if (isEditMode && category) {
        reset({ name: category.name });
        // When editing, initialize keptImageIds with all existing image IDs
        setKeptImageIds(category.multi_images.map((img) => img.id));
      } else {
        reset({ name: "" });
        setKeptImageIds([]);
      }
      setNewImages([]); // Always clear new images when modal opens
    }
  }, [category, isEditMode, reset, open]);

  const mutation = useMutation({
    mutationFn: isEditMode ? updateCategory : createCategory,
    onSuccess: () => {
      toast.success(
        `Category successfully ${isEditMode ? "updated" : "created"}.`
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (error) =>
      toast.error(`Error: ${JSON.stringify(error.response.data)}`),
  });

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
      toast.error("Vendor ID not found.");
      return;
    }

    const submissionData = {
      ...data,
      vendor_id: vendorId,
      uploaded_images: newImages,
    };

    if (isEditMode) {
      // The backend expects a comma-separated string for kept_image_ids
      submissionData.kept_image_ids = keptImageIds.join(",");
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
            rules={{ required: "Category name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                label="Category Name"
                fullWidth
                margin="normal"
              />
            )}
          />
          <Typography sx={{ mt: 2 }}>Upload Images</Typography>
          <Button variant="contained" component="label">
            Select Files
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
          <Typography variant="caption" display="block">
            {newImages.length} new file(s) selected.
          </Typography>

          {isEditMode && category?.multi_images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography>Manage Existing Images</Typography>
              <Grid container spacing={2}>
                {category.multi_images.map((image) => (
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
                        sx={{ position: "absolute", top: -10, right: -10 }}
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

export default CategoryFormModal;
