import axiosInstance from "./axios";

// --- Product Functions (UPDATED) ---
export const fetchProducts = async () => {
  const { data } = await axiosInstance.get("/inventory/products/");
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await axiosInstance.post(
    "/inventory/products/",
    productData
  );
  return data;
};

export const updateProduct = async ({ id, ...productData }) => {
  const { data } = await axiosInstance.put(
    `/inventory/products/${id}/`,
    productData
  );
  return data;
};

export const deleteProduct = async (id) => {
  await axiosInstance.delete(`/inventory/products/${id}/`);
};

// --- Warehouse Functions ---
export const fetchWarehouses = async () => {
  const { data } = await axiosInstance.get("/inventory/warehouses/");
  return data;
};

// --- Stock Functions ---
export const fetchStockList = async () => {
  const { data } = await axiosInstance.get("/inventory/stocks/");
  return data;
};
