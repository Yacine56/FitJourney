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

export default function Signup() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    age: "",
    height: "",
    weight: "",
    dailyCalorieGoal: "",
    targetWeight: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
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
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Signup failed");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      window.location.href = "/home";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const field = (name, label, props = {}) => (
    <TextField
      label={label}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      fullWidth
      required
      disabled={isSubmitting}
      {...props}
    />
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 520, mx: "auto", mt: 6 }} elevation={3}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Signup
      </Typography>

      <form onSubmit={submit}>
        <Stack spacing={2}>
          {field("username", "Username")}
          {field("email", "Email", { type: "email" })}
          {field("password", "Password", { type: "password" })}
          {field("fullName", "Full Name")}
          {field("age", "Age", { type: "number" })}
          {field("height", "Height (cm)", { type: "number" })}
          {field("weight", "Weight (lb)", { type: "number" })}
          {field("dailyCalorieGoal", "Daily Calorie Goal", { type: "number" })}
          {field("targetWeight", "Target Weight (lb)", { type: "number" })}

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
              height: 42,
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
                <span>Creating your account…</span>
              </Stack>
            ) : (
              "Create Account"
            )}
          </Button>

          {isSubmitting && (
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
            >
              Setting up your profile…
            </Typography>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
