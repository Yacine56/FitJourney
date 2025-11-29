import { useState } from "react";
import { TextField, Button, Paper, Typography, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
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
    window.location.href = "/home";
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: "auto", mt: 6 }} elevation={3}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>Login</Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          <TextField
            label="Username or Email"
            value={form.usernameOrEmail}
            onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
            fullWidth required
          />
          <TextField
            label="Password" type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth required
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" sx={{ bgcolor: "#18b5a7" }}>
            Login
          </Button>
          <Typography variant="body2" align="center">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </Typography>
        </Stack>
      </form>
    </Paper>
  );
}
