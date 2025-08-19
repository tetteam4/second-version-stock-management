import axiosInstance from "./axios";

// --- Order Functions ---
export const fetchOrders = async () => {
  const { data } = await axiosInstance.get("/restaurant/orders/");
  return data;
};

// --- Menu Functions ---
export const fetchMenus = async () => {
  const { data } = await axiosInstance.get("/restaurant/menus/");
  return data;
};

export const createMenuItem = async (menuItemData) => {
  const { data } = await axiosInstance.post("/restaurant/menus/", menuItemData);
  return data;
};

export const updateMenuItem = async ({ id, ...menuItemData }) => {
  const { data } = await axiosInstance.put(
    `/restaurant/menus/${id}/`,
    menuItemData
  );
  return data;
};

export const deleteMenuItem = async (id) => {
  await axiosInstance.delete(`/restaurant/menus/${id}/`);
};

// --- Category Functions (UPDATED) ---
export const fetchCategories = async () => {
  const { data } = await axiosInstance.get("/restaurant/categories/");
  return data;
};

export const createCategory = async (categoryData) => {
  // categoryData is an object like { name: "New Category Name" }
  const { data } = await axiosInstance.post(
    "/restaurant/categories/",
    categoryData
  );
  return data;
};

export const updateCategory = async ({ id, ...categoryData }) => {
  const { data } = await axiosInstance.put(
    `/restaurant/categories/${id}/`,
    categoryData
  );
  return data;
};

export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/restaurant/categories/${id}/`);
};
