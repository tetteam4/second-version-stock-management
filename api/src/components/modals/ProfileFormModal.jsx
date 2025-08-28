import React from "react"; // <-- THE FIX: This line was missing.
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
  Grid,
} from "@mui/material";
import { updateMyProfile } from "../../api/profileApi";

const ProfileFormModal = ({ open, onClose, profile }) => {
  const queryClient = useQueryClient();
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      phone_number: profile?.phone_number || "",
      city: profile?.city || "",
      about_me: profile?.about_me || "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      onClose();
    },
  });

  // This is the line (implicitly React.useEffect) that caused the error without the import
  React.useEffect(() => {
    if (profile) {
      reset({
        phone_number: profile.phone_number,
        city: profile.city,
        about_me: profile.about_me,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Your Profile</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error: {JSON.stringify(mutation.error.response.data)}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    margin="dense"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="City" fullWidth margin="dense" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="about_me"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="About Me"
                    fullWidth
                    margin="dense"
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileFormModal;
