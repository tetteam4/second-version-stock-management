import axiosInstance from "./axios";

// --- FIX ---
// This is the one and only function to get all user details.
// It correctly points to the '/profiles/all/' endpoint and handles the paginated response.
export const fetchAllUsers = async () => {
  const { data } = await axiosInstance.get("/profiles/all/");

  // Correctly access the 'results' array from the paginated 'profiles' object.
  if (data && data.profiles && Array.isArray(data.profiles.results)) {
    return data.profiles.results;
  }

  console.warn(
    "fetchAllUsers: API response did not contain a 'profiles.results' array.",
    data
  );
  return [];
};

// --- These functions remain the same ---
export const fetchAllProducts = async () => {
  const { data } = await axiosInstance.get("/inventory/products/");
  return data.results || data;
};

export const fetchAllSales = async () => {
  const { data } = await axiosInstance.get("/inventory/sales/");
  return data.results || data;
};

export const fetchAllVendors = async () => {
  console.warn(
    "API endpoint for listing all vendors not found. Returning placeholder data."
  );
  return [];
};
