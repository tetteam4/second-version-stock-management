import React from "react"; // It's good practice to import React when using JSX
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category"; 
/*
  This array defines the entire navigation structure of your application.
  - text: The display name of the link.
  - path: The route it navigates to.
  - icon: The MUI icon component to display.
  - roles: An array of role keys that are allowed to see this link.
           An empty array [] means it's visible to ALL authenticated users.
*/
export const navigationConfig = [
  {
    text: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
    roles: ["admin", "manager", "waiter", "chef", "admin"],
  },
  {
    text: "Orders",
    path: "/orders",
    icon: <ReceiptLongIcon />,
    roles: ["manager", "waiter", "admin"],
  },
  {
    text: "Categories", 
    path: "/categories",
    icon: <CategoryIcon />,
    roles: ["manager", "admin"],
  },
  {
    text: "Menu Management",
    path: "/menu",
    icon: <RestaurantMenuIcon />,
    roles: ["manager", "admin"],
  },
  {
    text: "Inventory",
    path: "/inventory",
    icon: <InventoryIcon />,
    roles: ["manager", "admin"],
  },
  {
    text: "Staff Management",
    path: "/staff",
    icon: <PeopleIcon />,
    roles: ["admin", "manager"],
  },
  {
    text: "Admin Settings",
    path: "/admin/settings",
    icon: <AdminPanelSettingsIcon />,
    roles: ["admin"],
  },
];
