import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { createAttributeType } from '../../api/categoryApi';
import { fetchCategories } from '../../api/categoryApi';
import { selectUser } from '../../features/auth/authSlice';

const attributeTypes = ["dropdown", "checkbox", "input"];

const AttributeFormModal = ({ open, onClose }) => {
    const queryClient = useQueryClient();
    const user = useSelector(selectUser);
    const { handleSubmit, control, reset } = useForm({
        defaultValues: { name: '', category: '', attribute_type: 'input' }
    });
    
    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'], queryFn: fetchCategories, enabled: open,
    });

    const mutation = useMutation({
        mutationFn: createAttributeType,
        onSuccess: () => {
            toast.success("Attribute created successfully.");
            queryClient.invalidateQueries({ queryKey: ['attributeTypes'] });
            onClose();
        },
        onError: (error) => toast.error(`Error: ${JSON.stringify(error.response.data)}`),
    });

    const onSubmit = (data) => {
        const vendorId = user?.vendor?.id;
        if (!vendorId) {
            toast.error("Vendor ID not found.");
            return;
        }
        mutation.mutate({ ...data, vendor_id: vendorId });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create New Attribute</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Controller name="name" control={control} rules={{ required: true }} render={({ field }) => <TextField {...field} label="Attribute Name" fullWidth margin="normal" />} />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Controller name="category" control={control} rules={{ required: true }} render={({ field }) => (
                            <Select {...field} label="Category" disabled={isLoadingCategories}>
                                {categories?.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                            </Select>
                        )} />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Input Type</InputLabel>
                        <Controller name="attribute_type" control={control} render={({ field }) => (
                            <Select {...field} label="Input Type">
                                {attributeTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                            </Select>
                        )} />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { reset(); onClose(); }}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={mutation.isPending}>
                        {mutation.isPending ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
export default AttributeFormModal;