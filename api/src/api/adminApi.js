import axiosInstance from "./axios";

// This function now correctly handles the paginated response from the backend.
export const fetchAllUsers = async () => {
  const { data } = await axiosInstance.get("/profiles/all/");

  // --- FIX ---
  // Check for the nested 'results' array inside the 'profiles' object.
  if (data && data.profiles && Array.isArray(data.profiles.results)) {
    return data.profiles.results; // <-- Return the correct array
  }

  // This warning will no longer appear, but it's good to keep for future debugging.
  console.warn(
    "fetchAllUsers: API response did not contain a 'profiles.results' array.",
    data
  );
  return [];
};

// --- These functions remain the same ---
export const fetchAllProducts = async () => {
  const { data } = await axiosInstance.get("/inventory/products/");
  return data;
};

export const fetchAllSales = async () => {
  const { data } = await axiosInstance.get("/inventory/sales/");
  return data;
};

export const fetchAllVendors = async () => {
  console.warn(
    "API endpoint for listing all vendors not found. Returning placeholder data."
  );
  return [];
};
