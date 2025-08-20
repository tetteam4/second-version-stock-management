import React from "react";
import { Typography, Box } from "@mui/material";

const WaiterDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Waiter Dashboard
      </Typography>
      <Typography>
        Assigned tables, active orders, and quick actions will be displayed
        here.
      </Typography>
    </Box>
  );
};

export default WaiterDashboard;
