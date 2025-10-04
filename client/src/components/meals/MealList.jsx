import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Box, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from "@mui/material";

function getLocalDate() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

const MealList = forwardRef(({ onDelete }, ref) => {
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  // confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  async function fetchMeals(date = selectedDate) {
    const res = await fetch(`http://localhost:5000/api/meals?date=${date}`, { credentials: "include" });
    const data = await res.json();
    setMeals(data.items || []);
  }

  useImperativeHandle(ref, () => ({ fetchMeals }));

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  function handleDeleteClick(id) {
    setDeleteId(id);
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (deleteId) onDelete(deleteId);
    setConfirmOpen(false);
    setDeleteId(null);
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}>
        Meals on {selectedDate}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, gap: 2 }}>
        <TextField type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} size="small" />
        <Button variant="outlined" onClick={() => setSelectedDate(getLocalDate())}>
          Today
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {["Meal Name", "Calories", "Protein", "Carbs", "Fats", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: "bold", color: "#1976d2" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {meals.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No meals logged</TableCell></TableRow>
            ) : (
              meals.map((m) => (
                <TableRow key={m._id}>
                  <TableCell sx={{ fontWeight: "600" }}>{m.mealName}</TableCell>
                  <TableCell>{m.calories} kcal</TableCell>
                  <TableCell>{m.protein} g</TableCell>
                  <TableCell>{m.carbs} g</TableCell>
                  <TableCell>{m.fats} g</TableCell>
                  <TableCell>
                    <Button
                      color="error"
                      variant="contained"
                      size="small"
                      onClick={() => handleDeleteClick(m._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this meal? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default MealList;
