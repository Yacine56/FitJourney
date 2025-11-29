import { useState } from "react";
import { TextField, Button, Paper, Typography, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    username: "", email: "", password: "", fullName: "",
    age: "", height: "", weight: "", dailyCalorieGoal: "", targetWeight: ""
  });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        dailyCalorieGoal: Number(form.dailyCalorieGoal),
        targetWeight: Number(form.targetWeight),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Signup failed");
      return;
    }
    const data = await res.json();
    setUser(data.user);              // cookie is already set by backend
    window.location.href = "/home";
  }

  const field = (name, label, props = {}) => (
    <TextField
      label={label}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      fullWidth required {...props}
    />
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 520, mx: "auto", mt: 6 }} elevation={3}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>Signup</Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          {field("username", "Username")}
          {field("email", "Email", { type: "email" })}
          {field("password", "Password", { type: "password" })}
          {field("fullName", "Full Name")}
          {field("age", "Age", { type: "number" })}
          {field("height", "Height (cm)", { type: "number" })}
          {field("weight", "Weight (kg)", { type: "number" })}
          {field("dailyCalorieGoal", "Daily Calorie Goal", { type: "number" })}
          {field("targetWeight", "Target Weight (kg)", { type: "number" })}
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" sx={{ bgcolor: "#18b5a7" }}>
            Create Account
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
