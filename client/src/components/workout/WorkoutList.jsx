import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";

// ✅ Helper to get correct local date string (prevents UTC offset issues)
function getLocalDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
}

const WorkoutList = forwardRef(({ onDelete, onEdit }, ref) => {
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString()); // ✅ fixed local date

  // 🔹 Function to fetch workouts (exposed to parent)
async function fetchWorkouts(date = selectedDate) {
  try {
    const tzOffset = new Date().getTimezoneOffset();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts?date=${date}&tzOffset=${tzOffset}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setWorkouts(data.items || []);
  } catch (err) {
    console.error("Failed to fetch workouts:", err);
  }
}



  // Expose fetchWorkouts to parent via ref
  useImperativeHandle(ref, () => ({
    fetchWorkouts,
  }));

  // Fetch whenever date changes
  useEffect(() => {
    fetchWorkouts(selectedDate);
  }, [selectedDate]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        align="center"
        sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
      >
        Workouts on {selectedDate}
      </Typography>

      {/* 🔹 Date picker */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, gap: 2 }}>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          size="small"
        />
        <Button
          variant="outlined"
          onClick={() => setSelectedDate(getLocalDateString())} // ✅ reset correctly
        >
          Reset to Today
        </Button>
      </Box>

      {/* 🔹 Workouts Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {[
                "Name",
                "Type",
                "Muscle",
                "Equipment",
                "Sets",
                "Reps",
                "Weight",
                "Notes",
                "Date",
                "Actions",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{ fontWeight: "bold", color: "#1976d2" }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {workouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No workouts for {selectedDate}.
                </TableCell>
              </TableRow>
            ) : (
              workouts.map((w) => (
                <TableRow key={w._id}>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.type}</TableCell>
                  <TableCell>{w.muscle}</TableCell>
                  <TableCell>{w.equipment}</TableCell>
                  <TableCell>{w.sets}</TableCell>
                  <TableCell>{w.reps}</TableCell>
                  <TableCell>{w.weight || "-"}</TableCell>
                  <TableCell>{w.notes || "-"}</TableCell>
                  <TableCell>
                    {new Date(w.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => onDelete(w._id)}
                    >
                      Delete
                    </Button>
                    {/* 
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => onEdit && onEdit(w)}
                    >
                      Edit
                    </Button> 
                    */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});

export default WorkoutList;
