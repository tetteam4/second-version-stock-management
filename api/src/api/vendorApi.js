import axiosInstance from "./axios";

// This is the function the "Approve" button will call.
// It sends a POST request to the endpoint an admin would use.
// NOTE: This assumes an admin-accessible endpoint exists or will be created.
// For now, it will call the existing vendor creation endpoint.
// A backend change is required to allow an admin to specify a user_id.
export const createVendorForUser = async (vendorData) => {
    // vendorData = { user_id, name, email }
    const { data } = await axiosInstance.post('/vendor/', vendorData);
    return data;
}