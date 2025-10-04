import { useState, useRef } from "react";
import { Snackbar, Alert, Box, Grid, Paper } from "@mui/material";
import MealSearch from "../components/meals/MealSearch";
import MealForm from "../components/meals/MealForm";
import MealList from "../components/meals/MealList";
import MealSummary from "../components/meals/MealSummary";

export default function Meal() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const listRef = useRef();
  const formRef = useRef();

  function handleSave(message = "Meal logged successfully!") {
    setSnackbar({ open: true, message, severity: "success" });
    listRef.current?.fetchMeals();
    setRefreshKey((prev) => prev + 1);
    setShowCustomForm(false);
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`http://localhost:5000/api/meals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Meal deleted.", severity: "info" });
        listRef.current?.fetchMeals();
        setRefreshKey((prev) => prev + 1);
      }
    } catch {
      setSnackbar({ open: true, message: "Error deleting meal.", severity: "error" });
    }
  }

  function handleAddCustom() {
    setShowCustomForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <MealSearch onLog={handleSave} onAddCustom={handleAddCustom} />

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)" }}>
              <MealList ref={listRef} onDelete={handleDelete} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)" }}>
              <MealSummary refreshKey={refreshKey} />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {showCustomForm && (
        <Box ref={formRef} sx={{ mt: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)" }}>
            <MealForm onSave={handleSave} />
          </Paper>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
