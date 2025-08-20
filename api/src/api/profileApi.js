import axiosInstance from "./axios";

// Fetches the profile for the currently logged-in user
export const fetchMyProfile = async () => {
  const { data } = await axiosInstance.get("/profiles/me/");
  // The response is nested, so we return the core profile object
  return data.profile;
};

// Updates the user's profile.
// The backend endpoint is PATCH /profiles/me/update/
// It expects multipart/form-data because of the profile_photo field.
export const updateMyProfile = async (profileData) => {
  const formData = new FormData();
  for (const key in profileData) {
    // Handle file uploads separately
    if (key === "profile_photo" && profileData[key] instanceof File) {
      formData.append(key, profileData[key]);
    } else if (profileData[key] != null) {
      // Append other non-null fields
      formData.append(key, profileData[key]);
    }
  }

  const { data } = await axiosInstance.patch("/profiles/me/update/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
