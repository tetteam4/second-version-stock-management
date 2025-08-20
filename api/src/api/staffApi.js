import axiosInstance from "./axios";

// Fetches the list of staff for the current vendor
export const fetchStaffList = async () => {
    const { data } = await axiosInstance.get('/restaurant/staff/');
    return data;
};

// Creates a new staff member
// staffData is an object like { user: userId, role: 'role_key' }
export const createStaffMember = async (staffData) => {
    const { data } = await axiosInstance.post('/restaurant/staff/', staffData);
    return data;
};

// Updates an existing staff member (e.g., to change their role)
export const updateStaffMember = async ({ id, ...staffData }) => {
    const { data } = await axiosInstance.put(`/restaurant/staff/${id}/`, staffData);
    return data;
};

// Deletes a staff member
export const deleteStaffMember = async (id) => {
    await axiosInstance.delete(`/restaurant/staff/${id}/`);
};
export const assignableRoles = [
    { key: 'cashier', label: 'Cashier' },
    { key: 'chef', label: 'Chef' },
    { key: 'waiter', label: 'Waiter' },
    { key: 'cleaner', label: 'Cleaner' }
];