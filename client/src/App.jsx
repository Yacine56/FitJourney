import { Routes, Route, Navigate } from "react-router-dom";
import AppNavbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/profile";
import Workout from "./pages/Workout";
import Meal from "./pages/Meal";

// inside <Routes>

import { CssBaseline, GlobalStyles } from "@mui/material";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            minHeight: "100vh",
            backgroundImage:
              "linear-gradient(180.7deg, rgba(11,47,159,1) -28.8%, rgba(199,255,216,1) 95.4%)",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          },
        }}
      />
      <AppNavbar authed={!!user} onLogout={logout} />
      <div style={{ padding: 24 }}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/home" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/home" replace /> : <Signup />}
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Add later: /meals, /workout, /profile protected routes */}
          <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/login"} replace />}
          />
          <Route
            path="/workout"
            element={
              <ProtectedRoute>
                <Workout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <Meal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}
