import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"; // New icon for products

export const navigationConfig = [
  {
    text: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
    roles: ["admin", "manager", "waiter", "chef"],
    businessTypes: [], // Empty means for ALL business types
  },
  {
    text: "Orders",
    path: "/orders",
    icon: <ReceiptLongIcon />,
    roles: ["manager", "waiter", "admin"],
    businessTypes: ["restaurant"], // RESTAURANT ONLY
  },
  {
    text: "Categories",
    path: "/categories",
    icon: <CategoryIcon />,
    roles: ["manager", "admin"],
    businessTypes: ["restaurant"], // RESTAURANT ONLY
  },
  {
    text: "Menu Management",
    path: "/menu",
    icon: <RestaurantMenuIcon />,
    roles: ["manager", "admin"],
    businessTypes: ["restaurant"], // RESTAURANT ONLY
  },
  {
    text: "Product Management", // NEW LINK FOR SHOPS
    path: "/products",
    icon: <ShoppingBasketIcon />,
    roles: ["manager", "admin"],
    businessTypes: ["shop"], // SHOP ONLY
  },
  {
    text: "Inventory",
    path: "/inventory",
    icon: <InventoryIcon />,
    roles: ["manager", "admin"],
    businessTypes: ["restaurant", "shop"], // For both
  },
  {
    text: "Staff Management",
    path: "/staff",
    icon: <PeopleIcon />,
    roles: ["admin", "manager"],
    businessTypes: [], // For all
  },
  {
    text: "My Profile",
    path: "/profile",
    icon: <AdminPanelSettingsIcon />,
    roles: [], // Empty roles = for ALL authenticated users
    businessTypes: [], // Empty businessTypes = for ALL business types
  },
  {
    text: "Admin Settings",
    path: "/admin/settings",
    icon: <AdminPanelSettingsIcon />,
    roles: ["admin"],
    businessTypes: [], // For all
  },
];
