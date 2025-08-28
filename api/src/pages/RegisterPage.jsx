import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { registerUser } from "../api/authApi";

const businessTypes = [
  { key: "restaurant", label: "Restaurant" },
  { key: "shop", label: "Shop" },
  { key: "hospital", label: "Hospital" },
  { key: "warehouse", label: "Warehouse" },
  { key: "factory", label: "Factory" },
  { key: "transport", label: "Transport" },
];

const RegisterPage = () => {
  const navigate = useNavigate();

  // --- FIX ---
  // Provide defaultValues to useForm to ensure all inputs are controlled from the start.
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      business_type: "",
      password: "",
      password2: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigate("/login?status=registered");
    },
  });

  // Note: The field name for the first password is "password", not "password1"
  const password = watch("password");

  const onSubmit = (data) => {
    // The CustomRegisterSerializer expects 'password1', not 'password'
    const submissionData = { ...data, password1: data.password };
    delete submissionData.password; // Clean up the old key
    mutation.mutate(submissionData);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            Registration failed. Error:{" "}
            {JSON.stringify(mutation.error.response.data)}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="First Name"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            )}
          />
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Last Name"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <FormControl fullWidth margin="normal" error={!!errors.business_type}>
            <InputLabel>Business Type</InputLabel>
            <Controller
              name="business_type"
              control={control}
              rules={{ required: "Business type is required" }}
              render={({ field }) => (
                <Select {...field} label="Business Type">
                  {businessTypes.map((type) => (
                    <MenuItem key={type.key} value={type.key}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.business_type && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  margin: "3px 14px 0",
                }}
              >
                {errors.business_type.message}
              </p>
            )}
          </FormControl>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
          <Controller
            name="password2"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type="password"
                error={!!errors.password2}
                helperText={errors.password2?.message}
              />
            )}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
          <Typography textAlign="center">
            Already have an account? <Link to="/login">Sign In</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
