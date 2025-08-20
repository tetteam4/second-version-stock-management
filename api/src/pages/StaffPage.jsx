import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Box, Typography, Button, Paper, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { fetchStaffList, deleteStaffMember } from '../api/staffApi';
import { fetchAllUsers } from '../api/adminApi';
import StaffFormModal from '../components/modals/StaffFormModal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const StaffPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const results = useQueries({
        queries: [
            { queryKey: ['staffList'], queryFn: fetchStaffList },
            { queryKey: ['allUsers'], queryFn: fetchAllUsers },
        ],
    });

    const isLoading = results.some((q) => q.isLoading);
    const isError = results.some((q) => q.isError);

    const staffList = results[0].data || [];
    const allProfiles = results[1].data || [];

    // "Join" the data together on the frontend to get full user details for each staff member
    const staffWithDetails = useMemo(() => {
        if (!staffList.length || !allProfiles.length) return [];

        // Create a Map of profiles with the user's UUID as the key for fast lookups
        const usersById = new Map(
            allProfiles.map((profile) => [profile.user_id, profile])
        );

        return staffList.map((staffMember) => ({
            ...staffMember,
            // Find the full profile object from the map using the staffMember's user ID
            userDetails: usersById.get(staffMember.user),
        }));
    }, [staffList, allProfiles]);

    const deleteMutation = useMutation({
        mutationFn: deleteStaffMember,
        onSuccess: () => {
            toast.success("Staff member removed.");
            queryClient.invalidateQueries({ queryKey: ["staffList"] });
        },
        onError: (error) => toast.error(`Error: ${error.message}`),
    });

    const handleDeleteClick = (id) => {
        setStaffToDelete(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(staffToDelete);
        setConfirmOpen(false);
        setStaffToDelete(null);
    };

    const handleOpenModal = (staffMember = null) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 180,
            valueGetter: (value, row) =>
                row.userDetails
                    ? `${row.userDetails.first_name} ${row.userDetails.last_name}`
                    : "Unknown User",
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1.5,
            minWidth: 220,
            valueGetter: (value, row) => row.userDetails?.email || "N/A",
        },
        {
            field: "role",
            headerName: "Role",
            flex: 1,
            minWidth: 120,
            valueGetter: (value, row) => row.role?.label || row.role,
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenModal(params.row)} size="small">
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleDeleteClick(params.row.id)}
                        color="error"
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    if (isError) {
        return <Alert severity="error">Error fetching staff data.</Alert>;
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h4" component="h1">
                    Staff Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={() => handleOpenModal()}
                >
                    Add Staff
                </Button>
            </Box>

            {/* Conditionally render the EmptyState or the DataGrid */}
            {!isLoading && staffWithDetails.length === 0 ? (
                <EmptyState
                    title="No Staff Members Found"
                    message="Get started by adding your first staff member to a role."
                    actionText="Add Staff"
                    onActionClick={() => handleOpenModal()}
                />
            ) : (
                <Paper sx={{ height: "75vh", width: "100%" }}>
                    <DataGrid
                        rows={staffWithDetails}
                        columns={columns}
                        loading={isLoading}
                        getRowId={(row) => row.id}
                    />
                </Paper>
            )}

            <StaffFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                staffMember={editingStaff}
            />
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Remove Staff Member?"
                message="Are you sure you want to remove this person from your staff?"
            />
        </Box>
    );
};

export default StaffPage;