import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

import { createStaffMember, updateStaffMember } from "../../api/staffApi";
import { fetchAllUsers } from "../../api/adminApi";
import { assignableRoles } from "../../config/roleConfig"; // This import will now work

const StaffFormModal = ({ open, onClose, staffMember }) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(staffMember);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: fetchAllUsers,
    enabled: open,
  });

  const { data: staffList } = useQuery({
    queryKey: ["staffList"],
    queryFn: () =>
      import("../../api/staffApi").then((mod) => mod.fetchStaffList()),
    enabled: open && !isEditMode,
  });

  const availableUsers = useMemo(() => {
    if (!allUsers) return [];
    if (isEditMode || !staffList) return allUsers;

    const staffUserIds = new Set(staffList.map((s) => s.user));
    return allUsers.filter((u) => !staffUserIds.has(u.id));
  }, [allUsers, staffList, isEditMode]);

  const mutation = useMutation({
    mutationFn: isEditMode ? updateStaffMember : createStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
      onClose();
    },
  });

  useEffect(() => {
    if (isEditMode && staffMember) {
      reset({
        user: staffMember.user,
        role: staffMember.role?.key || staffMember.role,
      });
    } else {
      reset({ user: "", role: "" });
    }
  }, [staffMember, isEditMode, reset, open]);

  const onSubmit = (data) => {
    if (isEditMode) {
      mutation.mutate({ id: staffMember.id, ...data });
    } else {
      mutation.mutate(data);
    }
  };

  // Determine user details for edit mode display
  const editModeUserDetails = useMemo(() => {
    if (!isEditMode || !allUsers || !staffMember) return null;
    return allUsers.find((u) => u.id === staffMember.user);
  }, [isEditMode, allUsers, staffMember]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Staff Role" : "Add New Staff Member"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error: {mutation.error.message}
            </Alert>
          )}

          <FormControl fullWidth margin="normal" error={!!errors.user}>
            <InputLabel>User</InputLabel>
            <Controller
              name="user"
              control={control}
              rules={{ required: "You must select a user" }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="User"
                  disabled={isLoadingUsers || isEditMode}
                >
                  {isEditMode && editModeUserDetails ? (
                    <MenuItem
                      key={editModeUserDetails.id}
                      value={editModeUserDetails.id}
                    >
                      {`${editModeUserDetails.first_name} ${editModeUserDetails.last_name}`}
                    </MenuItem>
                  ) : (
                    availableUsers.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {`${u.first_name} ${u.last_name} (${u.email})`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {errors.user && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  margin: "3px 14px 0",
                }}
              >
                {errors.user.message}
              </p>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Controller
              name="role"
              control={control}
              rules={{ required: "You must select a role" }}
              render={({ field }) => (
                <Select {...field} label="Role">
                  {assignableRoles.map((r) => (
                    <MenuItem key={r.key} value={r.key}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.role && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  margin: "3px 14px 0",
                }}
              >
                {errors.role.message}
              </p>
            )}
          </FormControl>
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

export default StaffFormModal;
