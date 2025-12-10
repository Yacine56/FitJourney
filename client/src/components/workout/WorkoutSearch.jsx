import { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Paper,
  Fade,
} from "@mui/material";

export default function WorkoutSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch(e) {
    e.preventDefault();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/search?muscle=${query}`,
      { credentials: "include" }
    );
    const data = await res.json();
    setResults(data.results || []);
    setQuery(""); // ✅ auto-clear
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        boxShadow: 3,
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
      >
        Find Workouts by Muscle 💪
      </Typography>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "8px", marginBottom: "0.5rem" }}
      >
        <TextField
          label="Search by muscle"
          placeholder="ex: Biceps or Chest"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ bgcolor: "#18b5a7" }}>
          SEARCH
        </Button>
      </form>

      {/* Helper note */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, mb: 1.5, display: "block" }}
      >
        Enter a muscle (e.g., “biceps”, “legs”, or “shoulders”) to explore
        matching workouts.
      </Typography>

      {/* Results */}
      <Grid container spacing={2} sx={{ mt: 2, justifyContent: "center" }}>
        {results.map((w, idx) => (
          <Fade in={true} timeout={400 + idx * 100} key={idx}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: 250,
                  height: 200,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
                  >
                    {w.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {w.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Muscle: {w.muscle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Equipment: {w.equipment  || "Dumbbells"}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      bgcolor: "#18b5a7",
                      borderRadius: "20px",
                      px: 3,
                    }}
                    onClick={() => onSelect(w)}
                  >
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Fade>
        ))}
      </Grid>
    </Paper>
  );
}
