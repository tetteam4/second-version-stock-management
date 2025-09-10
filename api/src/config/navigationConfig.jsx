import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const navigationConfig = [
  { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon />, roles: ["admin", "manager"], businessTypes: [] },
  { text: "Categories & Tools", path: "/categories", icon: <CategoryIcon />, roles: ["manager", "admin"], businessTypes: [] },
  { text: "Attributes", path: "/attributes", icon: <BuildIcon />, roles: ["manager", "admin"], businessTypes: [] },
  { text: "Products", path: "/products", icon: <ShoppingBasketIcon />, roles: ["manager", "admin"], businessTypes: [] },
  { text: "Inventory", path: "/inventory", icon: <InventoryIcon />, roles: ["manager", "admin"], businessTypes: [] },
  { text: "Staff Management", path: "/staff", icon: <PeopleIcon />, roles: ["admin", "manager"], businessTypes: [] },
  { text: "My Profile", path: "/profile", icon: <AccountCircleIcon />, roles: [], businessTypes: [] },
  { text: "Admin Settings", path: "/admin/settings", icon: <AdminPanelSettingsIcon />, roles: ["admin"], businessTypes: [] },
];