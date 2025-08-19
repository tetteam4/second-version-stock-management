import axiosInstance from "./axios";

// This function will fetch all orders for the logged-in vendor
export const fetchOrders = async () => {
  const { data } = await axiosInstance.get("/restaurant/orders/");
  return data;
};

// This function will fetch all menus
export const fetchMenus = async () => {
  const { data } = await axiosInstance.get("/restaurant/menus/");
  return data;
};

// Add other restaurant-related API calls here as needed
// For example:
// export const fetchCategories = async () => { ... };
