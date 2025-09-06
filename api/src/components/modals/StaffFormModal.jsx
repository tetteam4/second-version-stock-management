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
    const loggedInUser = useSelector(selectUser);

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            user: '',
            role: '',
            salary: '',
            start_day: '',
        }
    });

    // Fetches all user profiles (which now include user_id)
    const { data: allProfiles, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['allUsers'],
        queryFn: fetchAllUsers,
        enabled: open,
    });

    // Fetches current staff list
    const { data: staffList } = useQuery({
        queryKey: ['staffList'],
        queryFn: fetchStaffList,
        enabled: open && !isEditMode,
        initialData: [],
    });
    
    // Correctly filters the user profiles list
    const availableUsers = useMemo(() => {
        if (!allProfiles) return [];
        if (isEditMode) return allProfiles; // No need to filter in edit mode

   const staffUserIds = new Set(
     Array.isArray(staffList) ? staffList.map((s) => s.user) : []
   );
        // Filter profiles where the nested user_id is not in the staff list
        return allProfiles.filter(profile => !staffUserIds.has(profile.user_id));
    }, [allProfiles, staffList, isEditMode]);

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
// ddddd
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

    const onSubmit = (data) => {
        const vendorId = loggedInUser?.vendor?.id;
        if (!vendorId) {
            toast.error("Could not process: Your vendor ID is missing.");
            return;
        }
        const submissionData = { ...data, vendor: vendorId, attribute: {} };
        if (isEditMode) {
            mutation.mutate({ id: staffMember.id, ...submissionData });
        } else {
            mutation.mutate(submissionData);
        }
    };
    
    const editModeUserDetails = useMemo(() => {
        if (!isEditMode || !allProfiles || !staffMember) return null;
        return allProfiles.find(p => p.user_id === staffMember.user);
    }, [isEditMode, allProfiles, staffMember]);

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
                                         <MenuItem key={editModeUserDetails.user_id} value={editModeUserDetails.user_id}>
                                             {`${editModeUserDetails.first_name} ${editModeUserDetails.last_name}`}
                                         </MenuItem>
                                    ) : (
                                        availableUsers.map(profile => (
                                            <MenuItem key={profile.user_id} value={profile.user_id}>
                                                {`${profile.first_name} ${profile.last_name} (${profile.email})`}
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