import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Box, Typography, Button, Paper, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { fetchMenus, deleteMenu } from '../api/categoryApi'; // Use the new API
import ProductFormModal from '../components/modals/ProductFormModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

const ProductPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['menus'], // The backend model is 'Menu'
        queryFn: fetchMenus,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMenu,
        onSuccess: () => {
            toast.success("Product deleted.");
            queryClient.invalidateQueries({ queryKey: ['menus'] });
        },
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

    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const columns = [
        { field: 'category_name', headerName: 'Category', flex: 1, valueGetter: (value, row) => row.category_details?.name || 'N/A' },
        {
            field: 'attributes',
            headerName: 'Details',
            flex: 2,
            minWidth: 250,
            valueFormatter: (value) => {
                if (typeof value === 'object' && value !== null) {
                    return Object.entries(value).map(([key, val]) => `${key}: ${val}`).join(' | ');
                }
                return JSON.stringify(value);
            },
        },
        { field: 'is_available', headerName: 'Available', type: 'boolean' },
        {
            field: 'actions',
            headerName: 'Actions',
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenModal(params.row)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(params.row.id)} color="error"><DeleteIcon /></IconButton>
                </Box>
            ),
        },
    ];

    if (isError) return <Alert severity="error">Error fetching products.</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">Product Management</Typography>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenModal()}>New Product</Button>
            </Box>
            <Paper sx={{ height: '75vh', width: '100%' }}>
                <DataGrid rows={products || []} columns={columns} loading={isLoading} />
            </Paper>
            <ProductFormModal open={isModalOpen} onClose={handleCloseModal} product={editingProduct} />
            <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Delete Product?" message="Are you sure?"/>
        </Box>
    );
};
export default ProductPage;