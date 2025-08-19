import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1", // Make sure this matches your backend URL
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Request Interceptor: Injects the JWT token into the headers of every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers["Authorization"] = "Bearer " + accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
  Optional: Response Interceptor for handling token expiry.
  This is a more advanced setup for automatically refreshing tokens.
*/
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token (status 401) and it's not a retry request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as a retry
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            "http://127.0.0.1:8000/api/v1/auth/refresh/",
            {
              refresh: refreshToken,
            }
          );

          localStorage.setItem("access_token", data.access);
          axiosInstance.defaults.headers.common["Authorization"] =
            "Bearer " + data.access;
          originalRequest.headers["Authorization"] = "Bearer " + data.access;

          return axiosInstance(originalRequest); // Retry the original request with the new token
        } catch (refreshError) {
          // If refresh fails, log out the user
          console.error("Token refresh failed", refreshError);
          // Here you would dispatch a logout action
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
