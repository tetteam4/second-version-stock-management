import axiosInstance from "./axios";

// Fetches a list of all users in the system.
export const fetchAllUsers = async () => {
  const { data } = await axiosInstance.get("/auth/register/");
  return data;
};

// Fetches a list of all products from all vendors.
export const fetchAllProducts = async () => {
  const { data } = await axiosInstance.get("/inventory/products/");
  return data;
};

// Fetches a list of all sales from all vendors.
export const fetchAllSales = async () => {
  const { data } = await axiosInstance.get("/inventory/sales/");
  return data;
};

// This is a placeholder as the backend endpoint to list all vendors is missing.
export const fetchAllVendors = async () => {
  // We return an empty array so the frontend doesn't crash.
  // To make this work, a new endpoint (e.g., GET /api/v1/vendors/) would be needed on the backend.
  console.warn(
    "API endpoint for listing all vendors not found. Returning placeholder data."
  );
  return [];
};
