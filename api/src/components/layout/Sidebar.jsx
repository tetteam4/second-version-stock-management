import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

import { selectUser, logout } from "../../features/auth/authSlice.jsx";
import { navigationConfig } from "../../config/navigationConfig.jsx";

const Sidebar = ({ drawerWidth }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // --- FIX ---
  // The filter logic now checks both the user's role and business type.
  const accessibleRoutes = navigationConfig.filter((item) => {
    if (!user) return false;

    const userRole = user.role ? user.role.toLowerCase() : "";
    const userBusiness = user.business_type || "";

    // Check if the user's role is allowed (or if the link is for all roles)
    const hasRole = item.roles.length === 0 || item.roles.includes(userRole);

    // Check if the user's business type is allowed (or if the link is for all business types)
    const hasBusinessType =
      item.businessTypes.length === 0 ||
      item.businessTypes.includes(userBusiness);

    // The link is only shown if both conditions are met
    return hasRole && hasBusinessType;
  });

  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Chiq Frip ERP
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {accessibleRoutes.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                "&.active": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              {" "}
              <LogoutIcon />{" "}
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
