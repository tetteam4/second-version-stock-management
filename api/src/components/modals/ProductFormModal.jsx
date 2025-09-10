import React, { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Box, Switch, FormControlLabel } from '@mui/material';

import { createMenu, updateMenu, fetchCategories, fetchAttributeTypes, fetchAttributeValues } from '../../api/categoryApi';
import { selectUser } from '../../features/auth/authSlice';

// A sub-component to render the dynamic attribute fields
const AttributeInputs = ({ categoryId, control }) => {
    const { data: allAttrTypes } = useQuery({ queryKey: ['attributeTypes'], queryFn: fetchAttributeTypes });
    const { data: allAttrValues } = useQuery({ queryKey: ['attributeValues'], queryFn: fetchAttributeValues });

    const relevantAttributes = React.useMemo(() => {
        if (!categoryId || !allAttrTypes) return [];
        // NOTE: The new backend does not use 'tool_key', so we only filter by category
        return allAttrTypes.filter(attr => String(attr.category) === String(categoryId));
    }, [categoryId, allAttrTypes]);

    if (relevantAttributes.length === 0) return <Typography sx={{ mt: 2 }}>No attributes defined for this category.</Typography>;

    return (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Product Attributes</Typography>
            {relevantAttributes.map(attr => (
                <Controller
                    key={attr.id}
                    name={`attributes.${attr.name}`}
                    control={control}
                    defaultValue={attr.attribute_type === 'checkbox' ? false : ''}
                    render={({ field }) => {
                        if (attr.attribute_type === 'dropdown') {
                            const options = allAttrValues?.filter(val => val.attribute === attr.id) || [];
                            return (
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>{attr.name}</InputLabel>
                                    <Select {...field} label={attr.name}>
                                        {options.map(opt => <MenuItem key={opt.id} value={opt.attribute_value}>{opt.attribute_value}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            );
                        }
                        if (attr.attribute_type === 'checkbox') {
                             return <FormControlLabel control={<Switch {...field} checked={!!field.value} />} label={attr.name} />;
                        }
                        return <TextField {...field} label={attr.name} fullWidth margin="normal" type={attr.attribute_type === 'date' ? 'date' : 'text'} InputLabelProps={{ shrink: true }} />;
                    }}
                />
            ))}
        </Box>
    );
};


const ProductFormModal = ({ open, onClose, product }) => {
    const queryClient = useQueryClient();
    const user = useSelector(selectUser);
    const isEditMode = Boolean(product);
    const { handleSubmit, control, reset, watch } = useForm();
    const selectedCategoryId = watch('category');

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'], queryFn: fetchCategories, enabled: open,
    });

    useEffect(() => {
        if (open) {
            if (isEditMode) {
                reset({
                    category: product.category,
                    is_available: product.is_available,
                    attributes: product.attributes || {},
                });
            } else {
                reset({ category: '', is_available: true, attributes: {} });
            }
        }
    }, [product, isEditMode, reset, open]);

    const mutation = useMutation({
        mutationFn: isEditMode ? updateMenu : createMenu,
        onSuccess: () => {
            toast.success(`Product successfully ${isEditMode ? 'saved' : 'created'}.`);
            queryClient.invalidateQueries({ queryKey: ['menus'] });
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
        mutation.mutate({ ...data, vendor: vendorId });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Create New Product'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Controller name="category" control={control} rules={{ required: true }} render={({ field }) => (
                            <Select {...field} label="Category" disabled={isLoadingCategories}>
                                {categories?.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                            </Select>
                        )} />
                    </FormControl>
                    
                    {selectedCategoryId && <AttributeInputs categoryId={selectedCategoryId} control={control} />}

                    <Controller name="is_available" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch {...field} checked={!!field.value} />} label="Is Available" sx={{ mt: 1 }} />
                    )} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={mutation.isPending}>
                        {mutation.isPending ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
        // jdhfjadsf
    );
};
export default ProductFormModal;