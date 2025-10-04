import { useState } from "react";
import { TextField, Button, Grid, Card, CardContent, Typography, CardActions, Paper } from "@mui/material";

export default function WorkoutSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch(e) {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/workouts/search?muscle=${query}`, {
      credentials: "include",
    });
    const data = await res.json();
    setResults(data.results || []);
  }

  return (
    <Paper sx={{ p: 2, mb: 3,  borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.85)", // semi-transparent white
    backdropFilter: "blur(6px)", // frosted glass effect
    boxShadow: 3 }}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
        <TextField
          label="Search by muscle"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Search
        </Button>
      </form>

      {/* Results */}
      <Grid container spacing={2} sx={{ mt: 2, justifyContent: "center"  }}>
  {results.map((w, idx) => (
    <Grid item xs={12} sm={6} md={4} key={idx}>
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
      Equipment: {w.equipment}
    </Typography>
  </CardContent>

  <CardActions sx={{ justifyContent: "center" }}>
    <Button
      size="small"
      variant="contained"
      sx={{ bgcolor: "#18b5a7", borderRadius: "20px", px: 3 }}
      onClick={() => onSelect(w)}
    >
      Select
    </Button>
  </CardActions>
</Card>

    </Grid>
  ))}
</Grid>

    </Paper>
  );
}
