import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

const KpiCard = ({ title, value, icon, isLoading, color = "primary.main" }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {isLoading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
