import axiosInstance from "./axios";

// User registration function
// userData is { first_name, last_name, email, password, password2, business_type }
export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post("/auth/register/", userData);
  return data;
};

// We can move the login function here as well for better organization
export const loginUserAPI = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/token/", {
    email,
    password,
  });
  return data;
};
