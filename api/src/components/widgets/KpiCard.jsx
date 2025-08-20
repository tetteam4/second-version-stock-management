import React from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material"; // <-- Import Skeleton

const KpiCard = ({ title, value, icon, isLoading, color = "primary.main" }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        {isLoading ? (
          // --- FIX: Show skeleton loaders while data is fetching ---
          <Box>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height={40} />
          </Box>
        ) : (
          // Show the real data once loading is complete
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
                {value}
              </Typography>
            </Box>
            <Box sx={{ color: color, transform: "scale(1.5)", opacity: 0.6 }}>
              {icon}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
