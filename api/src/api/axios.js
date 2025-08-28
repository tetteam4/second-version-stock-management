import axios from "axios";

const axiosInstance = axios.create({
  // This URL MUST EXACTLY MATCH where your Django server is running.
  baseURL: "http://127.0.0.1:8000/api/v1",
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

// Response Interceptor for handling token expiry and network errors.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- FIX for "Cannot read properties of undefined (reading 'status')" ---
    // If error.response exists, it's a server error (like 401 Unauthorized)
    if (error.response) {
      // Check if the error is due to an expired token and it's not a retry request
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
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
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed", refreshError);
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., ERR_CONNECTION_REFUSED)
      console.error("Network Error: Could not connect to the server.", error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
