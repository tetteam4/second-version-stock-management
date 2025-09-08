import axiosInstance from "./axios";

export const fetchAllUsers = async () => {
  const { data } = await axiosInstance.get("/profiles/all/");

  if (data && data.profiles && Array.isArray(data.profiles.results)) {
    return data.profiles.results;
  }

  console.warn(
    "fetchAllUsers: API response did not contain a 'profiles.results' array.",
    data
  );
  return [];
};

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
