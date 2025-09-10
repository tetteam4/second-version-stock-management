import axiosInstance from "./axios";

// Helper for multipart/form-data requests
const buildFormData = (data) => {
    const formData = new FormData();
    for (const key in data) {
        if (data[key] != null) {
            if (key === 'uploaded_images' && Array.isArray(data[key])) {
                data[key].forEach(file => formData.append('uploaded_images', file));
            } else if (Array.isArray(data[key])) {
                formData.append(key, data[key].join(','));
            } else {
                formData.append(key, data[key]);
            }
        }
    }
    return formData;
};
const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

// --- Category Functions ---
export const fetchCategories = async () => {
    const { data } = await axiosInstance.get('/category/categories/');
    return data.results || data;
};
export const createCategory = async (categoryData) => {
    const formData = buildFormData(categoryData);
    const { data } = await axiosInstance.post('/category/categories/', formData, multipartConfig);
    return data;
};
export const updateCategory = async ({ id, ...categoryData }) => {
    const formData = buildFormData(categoryData);
    const { data } = await axiosInstance.put(`/category/categories/${id}/`, formData, multipartConfig);
    return data;
};
export const deleteCategory = async (id) => {
    await axiosInstance.delete(`/category/categories/${id}/delete/`);
};

// --- AttributeType Functions ---
export const fetchAttributeTypes = async () => {
    const { data } = await axiosInstance.get('/category/attribute-types/');
    return data.results || data;
};
export const createAttributeType = async (attrTypeData) => {
    const { data } = await axiosInstance.post('/category/attribute-types/', attrTypeData);
    return data;
};
export const updateAttributeType = async ({ id, ...attrTypeData }) => {
    const { data } = await axiosInstance.put(`/category/attribute-types/${id}/`, attrTypeData);
    return data;
};
export const deleteAttributeType = async (id) => {
    await axiosInstance.delete(`/category/attribute-types/${id}/`);
};

// --- AttributeValue Functions ---
export const fetchAttributeValues = async () => {
    const { data } = await axiosInstance.get('/category/attribute-values/');
    return data.results || data;
};
export const createAttributeValue = async (attrValueData) => {
    const { data } = await axiosInstance.post('/category/attribute-values/', attrValueData);
    return data;
};
export const deleteAttributeValue = async (id) => {
    await axiosInstance.delete(`/category/attribute-values/${id}/`);
};

// --- Menu Functions ---
export const fetchMenus = async () => {
    const { data } = await axiosInstance.get('/category/menus/');
    return data.results || data;
};
export const createMenu = async (menuData) => {
    const formData = buildFormData(menuData);
    const { data } = await axiosInstance.post('/category/menus/', formData, multipartConfig);
    return data;
};
export const updateMenu = async ({ id, ...menuData }) => {
    const formData = buildFormData(menuData);
    const { data } = await axiosInstance.patch(`/category/menus/${id}/`, formData, multipartConfig);
    return data;
};
export const deleteMenu = async (id) => {
    await axiosInstance.delete(`/category/menus/${id}/`);
};