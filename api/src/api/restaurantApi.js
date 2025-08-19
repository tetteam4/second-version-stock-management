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

// --- NEW FUNCTIONS START HERE ---

// This function fetches all categories for the vendor
export const fetchCategories = async () => {
  const { data } = await axiosInstance.get("/restaurant/categories/");
  return data;
};

// This function creates a new menu item
// menuItemData is an object like { name, category, vendor, menu_value, menu_type }
export const createMenuItem = async (menuItemData) => {
  const { data } = await axiosInstance.post("/restaurant/menus/", menuItemData);
  return data;
};

// This function updates an existing menu item
// It takes the item's ID and the new data
export const updateMenuItem = async ({ id, ...menuItemData }) => {
  const { data } = await axiosInstance.put(
    `/restaurant/menus/${id}/`,
    menuItemData
  );
  return data;
};

// This function deletes a menu item by its ID
export const deleteMenuItem = async (id) => {
  await axiosInstance.delete(`/restaurant/menus/${id}/`);
};
