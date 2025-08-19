import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "./api/axios";
import { setUser, logout } from "./features/auth/authSlice";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp > currentTime) {
        // Token is valid, fetch user profile
        axiosInstance
          .get("/profiles/me/")
          .then((response) => {
            dispatch(setUser(response.data));
          })
          .catch((error) => {
            console.error("Failed to fetch user on app load", error);
            dispatch(logout());
          });
      } else {
        // Token is expired, logout
        dispatch(logout());
      }
    }
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
