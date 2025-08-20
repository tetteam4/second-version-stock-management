import React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const MainLayout = () => {
  const drawerWidth = 240;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar drawerWidth={drawerWidth} />
      <Sidebar drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* This is a spacer to push content below the AppBar */}
        <Outlet />{" "}
        {/* This is where the routed page component will be rendered */}
      </Box>
    </Box>
  );
};

export default MainLayout;
