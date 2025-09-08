import axiosInstance from "./axios";

// --- FIX: A smarter FormData builder that handles file arrays correctly ---
const buildFormData = (data) => {
  const formData = new FormData();

  for (const key in data) {
    if (data[key] != null) {
      // If the key is for uploaded images, loop and append each file.
      if (key === "uploaded_images" && Array.isArray(data[key])) {
        data[key].forEach((file) => {
          formData.append("uploaded_images", file); // Append each file with the same key
        });
      }
      // For other array types (like kept_image_ids), convert to string
      else if (Array.isArray(data[key])) {
        formData.append(key, data[key].join(","));
      }
      // For all other types, append directly.
      else {
        formData.append(key, data[key]);
      }
    }
  }
  return formData;
};

const apiConfig = { headers: { "Content-Type": "multipart/form-data" } };

// --- Category Functions (Now using the new helper) ---
export const fetchCategories = async () => {
  const { data } = await axiosInstance.get("/restaurant/categories/");
  return data.results || data;
};
export const createCategory = async (categoryData) => {
  const formData = buildFormData(categoryData);
  const { data } = await axiosInstance.post(
    "/restaurant/categories/",
    formData,
    apiConfig
  );
  return data;
};
export const updateCategory = async ({ id, ...categoryData }) => {
  const formData = buildFormData(categoryData);
  const { data } = await axiosInstance.put(
    `/restaurant/categories/${id}/`,
    formData,
    apiConfig
  );
  return data;
};
export const deleteCategory = async (id) => {
  await axiosInstance.delete(`/restaurant/categories/${id}/`);
};

// --- Menu Functions (Now using the new helper) ---
export const fetchMenus = async () => {
  const { data } = await axiosInstance.get("/restaurant/menus/");
  return data.results || data;
};
export const createMenuItem = async (menuItemData) => {
  const formData = buildFormData(menuItemData);
  const { data } = await axiosInstance.post(
    "/restaurant/menus/",
    formData,
    apiConfig
  );
  return data;
};
export const updateMenuItem = async ({ id, ...menuItemData }) => {
  const formData = buildFormData(menuItemData);
  const { data } = await axiosInstance.patch(
    `/restaurant/menus/${id}/`,
    formData,
    apiConfig
  );
  return data;
};
export const deleteMenuItem = async (id) => {
  await axiosInstance.delete(`/restaurant/menus/${id}/`);
};

// --- Order Functions (Unchanged) ---
export const fetchOrders = async () => {
  const { data } = await axiosInstance.get("/restaurant/orders/");
  return data.results || data;
};
