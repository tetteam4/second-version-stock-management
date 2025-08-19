import React from "react";
import { Typography, Box } from "@mui/material";

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Administrator Dashboard
      </Typography>
      <Typography>
        System health overview, user management, and global settings will be
        displayed here.
      </Typography>
    </Box>
  );
};

export default AdminDashboard;
