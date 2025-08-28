import React, { useState } from "react"; // <-- FIX: Combined into a single import line
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { fetchMyProfile } from "../api/profileApi";
import ProfileFormModal from "../components/modals/ProfileFormModal.jsx";

// A simple component to display a piece of profile information
const ProfileDetail = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value || "Not set"}</Typography>
  </Box>
);

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchMyProfile,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Error fetching your profile: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Edit Profile
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Avatar
              alt={profile.full_name}
              src={profile.profile_photo}
              sx={{ width: 150, height: 150, mx: "auto", mb: 2 }}
            />
            <Typography variant="h5">{profile.full_name}</Typography>
            <Typography color="text.secondary">{profile.role}</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <ProfileDetail label="Email Address" value={profile.email} />
            <ProfileDetail label="Phone Number" value={profile.phone_number} />
            <Divider sx={{ my: 2 }} />
            <ProfileDetail
              label="Business Type"
              value={profile.business_type}
            />
            <ProfileDetail
              label="Location"
              value={
                profile.city && profile.country
                  ? `${profile.city}, ${profile.country}`
                  : "Not set"
              }
            />
            <Divider sx={{ my: 2 }} />
            <ProfileDetail label="About Me" value={profile.about_me} />
          </Grid>
        </Grid>
      </Paper>

      <ProfileFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
      />
    </Box>
  );
};

export default ProfilePage;
