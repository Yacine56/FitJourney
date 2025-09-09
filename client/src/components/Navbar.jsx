import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const authedLinks = [
  { label: "Home", to: "/home" },
  { label: "Meals", to: "/meals" },
  { label: "Workout", to: "/workout" },
  { label: "Profile", to: "/profile" },
];

export default function AppNavbar({ authed, onLogout }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const handleNav = (to) => {
    setOpen(false);
    nav(to);
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#18b5a7" }}>
        <Toolbar>
          {/* mobile menu button */}
          <Box sx={{ display: { xs: "block", md: "none" }, mr: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setOpen(true)}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* brand */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, cursor: "pointer" }}
            onClick={() => nav(authed ? "/home" : "/login")}
          >
            FitJourney
          </Typography>

          {/* desktop links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, ml: 3, gap: 1 }}>
            {authed &&
              authedLinks.map((l) => (
                <Button
                  key={l.to}
                  color="inherit"
                  component={RouterLink}
                  to={l.to}
                >
                  {l.label}
                </Button>
              ))}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* right side auth buttons (desktop) */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {authed ? (
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/signup">
                  Signup
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* mobile drawer */}
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List sx={{ py: 1 }}>
            <ListItem>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                FitJourney
              </Typography>
            </ListItem>
          </List>
          <Divider />
          <List>
            {authed
              ? authedLinks.map((l) => (
                  <ListItem key={l.to} disablePadding>
                    <ListItemButton onClick={() => handleNav(l.to)}>
                      <ListItemText primary={l.label} />
                    </ListItemButton>
                  </ListItem>
                ))
              : (
                <>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNav("/login")}>
                      <ListItemText primary="Login" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNav("/signup")}>
                      <ListItemText primary="Signup" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
          </List>
          {authed && (
            <>
              <Divider />
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { setOpen(false); onLogout?.(); }}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
