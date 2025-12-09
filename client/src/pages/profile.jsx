import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, Grid, TextField,
  Button, Stack, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import { useAuth } from "../context/AuthContext";



export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    height: "",
    weight: "",
    dailyCalorieGoal: "",
    targetWeight: "",
  });

  // Change password dialog state
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  // Load current profile from API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: "include" });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser?.(data.user);
        setForm({
          fullName: data.user.fullName || "",
          age: data.user.age ?? "",
          height: data.user.height ?? "",
          weight: data.user.weight ?? "",
          dailyCalorieGoal: data.user.dailyCalorieGoal ?? "",
          targetWeight: data.user.targetWeight ?? "",
        });
      } catch (e) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser]);

  function updateField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setError("");

    const payload = {
      fullName: form.fullName,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      dailyCalorieGoal: Number(form.dailyCalorieGoal),
      targetWeight: Number(form.targetWeight),
    };

    // All-or-nothing guard
    for (const [k, v] of Object.entries(payload)) {
      const isNum = ["age", "height", "weight", "dailyCalorieGoal", "targetWeight"].includes(k);
      if (v === "" || v === null || (isNum && Number.isNaN(v))) {
        setError("All profile fields are required and must be valid numbers.");
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      setUser?.(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function resetToServerValues() {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        age: user.age ?? "",
        height: user.height ?? "",
        weight: user.weight ?? "",
        dailyCalorieGoal: user.dailyCalorieGoal ?? "",
        targetWeight: user.targetWeight ?? "",
      });
      setError("");
    }
  }

  // Change password submit
  async function submitPasswordChange() {
    setPwdError("");

    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmNewPassword) {
      setPwdError("All fields are required.");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    // optional: client-side strength check
    if (pwdForm.newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setPwdOpen(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (e) {
      setPwdError(e.message);
    }
  }

  if (loading) return null; // or a spinner

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Profile
        </Typography>

        {/* Read-only basics */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2"><strong>Username:</strong> {user?.username}</Typography>
          <Typography variant="body2"><strong>Email:</strong> {user?.email}</Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <form onSubmit={saveProfile}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Age"
                type="number"
                fullWidth
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Height (cm)"
                type="number"
                fullWidth
                value={form.height}
                onChange={(e) => updateField("height", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Weight (lbs)"
                type="number"
                fullWidth
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                required
                disabled
              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <TextField
                label="Daily Calorie Goal"
                type="number"
                fullWidth
                value={form.dailyCalorieGoal}
                onChange={(e) => updateField("dailyCalorieGoal", e.target.value)}
                required
              />
            </Grid> */}

            <Grid item xs={12} md={6}>
              <TextField
                label="Target Weight (lbs)"
                type="number"
                fullWidth
                value={form.targetWeight}
                onChange={(e) => updateField("targetWeight", e.target.value)}
                required
              />
            </Grid>
          </Grid>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: "#18b5a7" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outlined" onClick={resetToServerValues}>
              Reset
            </Button>
            <Button variant="text" onClick={() => setPwdOpen(true)}>
              Change Password
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={pwdForm.confirmNewPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, confirmNewPassword: e.target.value })}
              fullWidth
              required
            />
            {pwdError && <Typography color="error">{pwdError}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#18b5a7" }} onClick={submitPasswordChange}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

