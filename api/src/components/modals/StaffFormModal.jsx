import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, TextField } from '@mui/material';

import { createStaffMember, updateStaffMember, fetchStaffList } from '../../api/staffApi';
import { fetchAllUsers } from '../../api/adminApi';
import { assignableRoles } from '../../config/roleConfig.jsx';
import { selectUser } from '../../features/auth/authSlice.jsx';

const StaffFormModal = ({ open, onClose, staffMember }) => {
    const queryClient = useQueryClient();
    const isEditMode = Boolean(staffMember);
    const loggedInUser = useSelector(selectUser); // The manager who is logged in

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        // Add default values for all required fields to prevent uncontrolled input errors
        defaultValues: {
            user: '',
            role: '',
            salary: '',
            start_day: '',
        }
    });

    // Fetch all users to populate the user selection dropdown
    const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['allUsers'],
        queryFn: fetchAllUsers,
        enabled: open,
    });

    // Fetches current staff to filter out users who are already staff members
    const { data: staffList } = useQuery({
        queryKey: ['staffList'],
        queryFn: fetchStaffList,
        enabled: open && !isEditMode,
    });
    
    // Filters the user list to show only users who are not already staff
    const availableUsers = useMemo(() => {
        if (!allUsers) return [];
        if (isEditMode || !staffList) return allUsers;
        const staffUserIds = new Set(staffList.map(s => s.user));
        return allUsers.filter(u => !staffUserIds.has(u.id));
    }, [allUsers, staffList, isEditMode]);

    const mutation = useMutation({
        mutationFn: isEditMode ? updateStaffMember : createStaffMember,
        onSuccess: () => {
            toast.success(`Staff member successfully ${isEditMode ? 'updated' : 'added'}.`);
            queryClient.invalidateQueries({ queryKey: ['staffList'] });
            onClose();
        },
        onError: (error) => {
            toast.error(`Error: ${JSON.stringify(error.response.data)}`);
        }
    });

    // Effect to populate form when editing or clear it for a new entry
    useEffect(() => {
        if (open) {
            if (isEditMode && staffMember) {
                reset({
                    user: staffMember.user,
                    role: staffMember.role?.key || staffMember.role,
                    salary: staffMember.salary || '',
                    start_day: staffMember.start_day || '',
                });
            } else {
                reset({ user: '', role: '', salary: '', start_day: '' });
            }
        }
    }, [staffMember, isEditMode, reset, open]);

    // This function sends all required data to the backend
    const onSubmit = (data) => {
        const vendorId = loggedInUser?.vendor?.id;
        if (!vendorId) {
            toast.error("Could not process: Your vendor ID is missing.");
            return;
        }

        const submissionData = {
            ...data,
            vendor: vendorId,
            attribute: {}, // Sending an empty JSON object to satisfy the 'attribute' requirement
        };

        if (isEditMode) {
            mutation.mutate({ id: staffMember.id, ...submissionData });
        } else {
            mutation.mutate(submissionData);
        }
    };
    
    // Memoized calculation to find the full user details for display in edit mode
    const editModeUserDetails = useMemo(() => {
        if (!isEditMode || !allUsers || !staffMember) return null;
        return allUsers.find(u => u.id === staffMember.user);
    }, [isEditMode, allUsers, staffMember]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditMode ? 'Edit Staff Role' : 'Add New Staff Member'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {mutation.isError && <Alert severity="error" sx={{ mb: 2 }}>Error: {JSON.stringify(mutation.error.response.data)}</Alert>}
                    
                    <FormControl fullWidth margin="normal" error={!!errors.user}>
                        <InputLabel>User</InputLabel>
                        <Controller
                            name="user"
                            control={control}
                            rules={{ required: 'You must select a user' }}
                            render={({ field }) => (
                                <Select {...field} label="User" disabled={isLoadingUsers || isEditMode}>
                                    {isEditMode && editModeUserDetails ? (
                                         <MenuItem key={editModeUserDetails.id} value={editModeUserDetails.id}>
                                             {`${editModeUserDetails.first_name} ${editModeUserDetails.last_name}`}
                                         </MenuItem>
                                    ) : (
                                        availableUsers.map(u => (
                                            <MenuItem key={u.id} value={u.id}>
                                                {`${u.first_name} ${u.last_name} (${u.email})`}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            )}
                        />
                         {errors.user && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.user.message}</p>}
                    </FormControl>

                    <FormControl fullWidth margin="normal" error={!!errors.role}>
                        <InputLabel>Role</InputLabel>
                        <Controller
                            name="role"
                            control={control}
                            rules={{ required: 'You must select a role' }}
                            render={({ field }) => (
                                <Select {...field} label="Role">
                                    {assignableRoles.map(r => (
                                        <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.role && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.role.message}</p>}
                    </FormControl>

                    <Controller
                        name="salary"
                        control={control}
                        rules={{ required: 'Salary is required', min: { value: 0, message: 'Salary must be a positive number' } }}
                        render={({ field }) => (
                            <TextField {...field} label="Salary" type="number" fullWidth margin="normal" error={!!errors.salary} helperText={errors.salary?.message}/>
                        )}
                    />
                    <Controller
                        name="start_day"
                        control={control}
                        rules={{ required: 'Start day is required' }}
                        render={({ field }) => (
                            <TextField {...field} label="Start Day" type="date" fullWidth margin="normal" error={!!errors.start_day} helperText={errors.start_day?.message} InputLabelProps={{ shrink: true }}/>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={mutation.isPending}>
                        {mutation.isPending ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default StaffFormModal;