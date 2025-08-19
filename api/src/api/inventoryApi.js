import axiosInstance from "./axios";

// Fetches the list of all products (e.g., "Flour", "Sugar", "Tomatoes")
export const fetchProducts = async () => {
  const { data } = await axiosInstance.get("/inventory/products/");
  return data;
};

// Fetches the list of all warehouses (e.g., "Main Storage", "Cold Storage")
export const fetchWarehouses = async () => {
  const { data } = await axiosInstance.get("/inventory/warehouses/");
  return data;
};

// Fetches the list of all stock items, which links products to warehouses
// and includes the quantity.
export const fetchStockList = async () => {
  const { data } = await axiosInstance.get("/inventory/stocks/");
  return data;
};

// You can add create, update, and delete functions here later
// export const createStockItem = async (stockData) => { ... };
