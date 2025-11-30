import { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: "auto", mt: 6 }} elevation={3}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Login
      </Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          <TextField
            label="Username or Email"
            value={form.usernameOrEmail}
            onChange={(e) =>
              setForm({ ...form, usernameOrEmail: e.target.value })
            }
            fullWidth
            required
            disabled={isSubmitting}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            fullWidth
            required
            disabled={isSubmitting}
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#18b5a7",
              height: 40,
              fontWeight: 600,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress
                  size={18}
                  thickness={5}
                  sx={{ color: "white" }}
                />
                <span>Logging in…</span>
              </Stack>
            ) : (
              "Login"
            )}
          </Button>

          {isSubmitting && (
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
            >
              Please wait while we verify your credentials…
            </Typography>
          )}

          <Typography variant="body2" align="center">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </Stack>
      </form>
    </Paper>
  );
}
