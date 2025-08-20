import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const EmptyState = ({ title, message, actionText, onActionClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        border: "1px dashed #ccc",
        borderRadius: 2,
        height: "60vh",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {actionText && onActionClick && (
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={onActionClick}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
