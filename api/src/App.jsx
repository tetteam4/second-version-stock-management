import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast"; // <-- Import the Toaster
import { jwtDecode } from "jwt-decode";
import axiosInstance from "./api/axios";
import { setUser, logout } from "./features/auth/authSlice.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          axiosInstance
            .get("/profiles/me/")
            .then((response) => {
              // The profile data is nested, so we dispatch the correct object
              dispatch(setUser(response.data.profile));
            })
            .catch((error) => {
              console.error("Failed to fetch user on app load", error);
              dispatch(logout());
            });
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Invalid token found", error);
        dispatch(logout());
      }
    }
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      {/* --- FIX --- */}
      {/* This component will handle rendering all toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
