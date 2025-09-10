import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Box, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

import { createCategory, updateCategory } from '../../api/categoryApi';
import { selectUser } from '../../features/auth/authSlice';

const CategoryFormModal = ({ open, onClose, category }) => {
    const queryClient = useQueryClient();
    const isEditMode = Boolean(category);
    const user = useSelector(selectUser);
    const [toolInput, setToolInput] = useState('');

    const { handleSubmit, control, reset } = useForm({
        defaultValues: { name: '', tools: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "tools"
    });

    const mutation = useMutation({
        mutationFn: isEditMode ? updateCategory : createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onClose();
            toast.success(`Category successfully ${isEditMode ? 'saved' : 'created'}.`);
        },
        onError: (error) => toast.error(`Error: ${JSON.stringify(error.response.data)}`),
    });

    useEffect(() => {
        if (open) {
            if (isEditMode) {
                reset({ name: category.name, tools: category.tools?.map(tool => ({ value: tool })) || [] });
            } else {
                reset({ name: '', tools: [] });
            }
            setToolInput('');
        }
    }, [category, isEditMode, reset, open]);

    const handleAddTool = () => {
        if (toolInput.trim() !== '') {
            append({ value: toolInput.trim() });
            setToolInput('');
        }
    };

    const onSubmit = (data) => {
        const vendorId = user?.vendor?.id;
        if (!vendorId) {
            toast.error("Vendor ID not found.");
            return;
        }
        const formattedTools = data.tools.map(tool => tool.value);
        const submissionData = { ...data, tools: formattedTools, vendor: vendorId };

        if (isEditMode) {
            mutation.mutate({ id: category.id, ...submissionData });
        } else {
            mutation.mutate(submissionData);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{isEditMode ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Controller name="name" control={control} rules={{ required: 'Category name is required' }}
                        render={({ field }) => <TextField {...field} autoFocus label="Category Name" fullWidth margin="normal" />}
                    />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Tools</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            label="Add a new tool (e.g., Laptop, T-Shirt)"
                            value={toolInput}
                            onChange={(e) => setToolInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTool(); } }}
                            size="small"
                            sx={{ flexGrow: 1 }}
                        />
                        <Button variant="outlined" onClick={handleAddTool} startIcon={<AddCircleIcon />}>Add</Button>
                    </Box>
                    <List dense>
                        {fields.map((field, index) => (
                            <ListItem key={field.id}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => remove(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText primary={field.value} />
                            </ListItem>
                        ))}
                    </List>
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
export default CategoryFormModal;