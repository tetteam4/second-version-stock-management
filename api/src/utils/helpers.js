// A helper function to determine the color of the status chip
export const getStatusChipColor = (status) => {
  if (!status) return "default";

  switch (status.toLowerCase()) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "accepted":
      return "info";
    case "cancelled":
    case "rejected":
      return "error";
    default:
      return "default";
  }
};
