// These are the roles a manager can assign to other users.
// The 'key' must match the 'key' field in your Django Role model.
// The 'label' is what the user will see in the dropdown.
export const assignableRoles = [
  { key: "cashier", label: "Cashier" },
  { key: "chef", label: "Chef" },
  { key: "waiter", label: "Waiter" },
  { key: "cleaner", label: "Cleaner" },
  { key: "admin", label: "Admin" },
];
