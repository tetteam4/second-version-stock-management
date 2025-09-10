import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Box, Typography, Button, Paper, Alert, IconButton, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { fetchCategories, deleteCategory } from '../api/categoryApi';
import CategoryFormModal from '../components/modals/CategoryFormModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

const CategoryPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            toast.success("Category deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => toast.error(`Error: ${error.response.data.detail || 'Could not delete category.'}`),
    });

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(itemToDelete);
        setConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleOpenModal = (category = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingCategory(null);
        setIsModalOpen(false);
    };

    const columns = [
        { field: 'name', headerName: 'Category Name', flex: 1, minWidth: 150 },
        {
            field: 'tools',
            headerName: 'Tools',
            flex: 2,
            minWidth: 250,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
                    {Array.isArray(params.value) && params.value.map((tool, index) => (
                        <Chip key={index} label={tool} size="small" />
                    ))}
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenModal(params.row)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(params.row.id)} color="error" size="small"><DeleteIcon /></IconButton>
                </Box>
            ),
        },
    ];

    if (isError) return <Alert severity="error">Error fetching categories.</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">Category & Tool Management</Typography>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenModal()}>New Category</Button>
            </Box>
            <Paper sx={{ height: '75vh', width: '100%' }}>
                <DataGrid rows={categories || []} columns={columns} loading={isLoading} />
            </Paper>
            <CategoryFormModal open={isModalOpen} onClose={handleCloseModal} category={editingCategory} />
            <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Delete Category?" message="Are you sure? This will also remove associated attributes." />
        </Box>
    );
};

export default CategoryPage;