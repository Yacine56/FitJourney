// client/src/pages/Workout.jsx
import { useState, useRef } from "react";
import { Snackbar, Alert, Paper, Box, Grid } from "@mui/material";
import WorkoutSearch from "../components/workout/WorkoutSearch";
import WorkoutForm from "../components/workout/WorkoutForm";
import WorkoutList from "../components/workout/WorkoutList";

export default function Workout() {
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const listRef = useRef();

  function handleSelect(workout) {
    setSelectedWorkout(workout);
  }

  function handleSave() {
    setSelectedWorkout(null);
    setSnackbar({
      open: true,
      message: "Workout saved successfully!",
      severity: "success",
    });
    listRef.current?.fetchWorkouts();
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`http://localhost:5000/api/workouts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Workout deleted.",
          severity: "info",
        });
        listRef.current?.fetchWorkouts();
      } else {
        const err = await res.json();
        setSnackbar({
          open: true,
          message: err.error || "Failed to delete workout.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleting workout.",
        severity: "error",
      });
    }
  }

  function handleError(message) {
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  }

  return (
    <div style={{ padding: "2rem" }}>
      
      <WorkoutSearch onSelect={handleSelect} />

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3} alignItems="flex-start">
  {/* Workout List (left side) */}
  <Grid item xs={12} md={5}>
    <Paper sx={{ p: 2, borderRadius: 2 ,
       backgroundColor: "rgba(255, 255, 255, 0.85)", // semi-transparent
    backdropFilter: "blur(6px)", // glassy effect
     }}>
      <WorkoutList ref={listRef} onDelete={handleDelete} />
    </Paper>
  </Grid>

  {/* Workout Form (right side, wider) */}
  {selectedWorkout && (
    <Grid item xs={12} md={7}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
           backgroundColor: "rgba(255, 255, 255, 0.85)", // semi-transparent
            backdropFilter: "blur(6px)", // glassy effect
          gap: 2,
        }}
      >
        <WorkoutForm
          selected={selectedWorkout}
          onSave={handleSave}
          onError={handleError}
        />
      </Paper>
    </Grid>
  )}
</Grid>

      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
