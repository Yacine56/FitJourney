import { useState, useEffect } from "react";
import { TextField, Button, Paper, Typography } from "@mui/material";

export default function WorkoutForm({ selected, onSave }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    muscle: "",
    equipment: "",
    sets: "",
    reps: "",
    weight: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form whenever selected workout changes
  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        type: selected.type || "",
        muscle: selected.muscle || "",
        equipment: selected.equipment || "",
        sets: "",
        reps: "",
        weight: "",
        notes: "",
      });
      setErrors({});
      setServerError("");
    }
  }, [selected]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // --- Client-side validation ---
  function validate() {
    const newErrors = {};

    if (!form.sets || Number(form.sets) < 1) {
      newErrors.sets = "Sets must be at least 1";
    }
    if (!form.reps || Number(form.reps) < 1) {
      newErrors.reps = "Reps must be at least 1";
    }
    if (form.weight && Number(form.weight) < 0) {
      newErrors.weight = "Weight must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // --- Save to backend ---
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/workouts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save workout");
      }

      onSave(data.workout); // push to parent list
      setForm({
        name: "",
        type: "",
        muscle: "",
        equipment: "",
        sets: "",
        reps: "",
        weight: "",
        notes: "",
      });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!selected) return null; // only show when a workout is selected

  return (
    <Paper sx={{ p: 3, mt: 3, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Log Workout
      </Typography>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <TextField name="name" label="Name" value={form.name} onChange={handleChange} required />
        <TextField name="type" label="Type" value={form.type} onChange={handleChange} required />
        <TextField name="muscle" label="Muscle" value={form.muscle} onChange={handleChange} required />
        <TextField name="equipment" label="Equipment" value={form.equipment} onChange={handleChange} required />

        <TextField
          name="sets"
          label="Sets"
          type="number"
          value={form.sets}
          onChange={handleChange}
          error={!!errors.sets}
          helperText={errors.sets}
          
        />
        <TextField
          name="reps"
          label="Reps"
          type="number"
          value={form.reps}
          onChange={handleChange}
          error={!!errors.reps}
          helperText={errors.reps}
        />
        <TextField
          name="weight"
          label="Weight"
          type="number"
          value={form.weight}
          onChange={handleChange}
          error={!!errors.weight}
          helperText={errors.weight}
        />
        <TextField name="notes" label="Notes" multiline rows={3} value={form.notes} onChange={handleChange} />

        {serverError && (
          <Typography color="error" variant="body2">
            {serverError}
          </Typography>
        )}

        <Button type="submit" variant="contained" sx={{ bgcolor: "#18b5a7" }} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>
    </Paper>
  );
}
