import { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CardActions,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Box,
} from "@mui/material";

export default function MealSearch({ onLog, onAddCustom }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [userParts, setUserParts] = useState([]);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setResults([]);

    const parts = query.split(/\band\b/i).map((s) => s.trim());
    setUserParts(parts);

    const res = await fetch(
      `http://localhost:5000/api/meals/search?query=${query}`,
      {
        credentials: "include",
      }
    );
    const data = await res.json();

    if (data.results?.length > 0) {
      setResults(data.results);
      setQuery(""); // ✅ auto-clear input
    } else {
      setResults([]);
      setNotFound(true);
    }
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
      {/* Search + Custom button row */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* Form (input + search button) */}
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", flexGrow: 1, gap: "8px" }}
        >
          <TextField
            label="Search Your Meal"
            placeholder="ex: 200g chicken and 2 bananas"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: "#18b5a7", px: 3 }}
          >
            SEARCH
          </Button>
        </form>

        {/* Custom Meal Button */}
        <Button
          variant="outlined"
          sx={{ minWidth: "150px", whiteSpace: "nowrap" }}
          onClick={onAddCustom}
        >
          + ADD CUSTOM MEAL
        </Button>
      </Box>

      {/* Note */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        Default serving is usually 100 grams or 1 cup depending on the food. You
        can specify amounts (e.g. "250g rice", "2 bananas and 1 cup milk").
      </Typography>

      {/* Results */}
      <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        {results.map((item, idx) => {
          const header = userParts[idx] || item.mealName;
          return (
            <Grid item key={idx}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: 260,
                  height: 220,
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
                    {header}
                  </Typography>
                  <Typography variant="body2">
                    Calories: {item.calories.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Protein: {item.protein} g
                  </Typography>
                  <Typography variant="body2">
                    Carbs: {item.carbs} g
                  </Typography>
                  <Typography variant="body2">
                    Fats: {item.fats} g
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
                    onClick={async () => {
                      await fetch("http://localhost:5000/api/meals", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ ...item, mealName: header }),
                      });
                      onLog("Meal logged successfully!"); // ✅ snackbar + refresh
                    }}
                  >
                    Log Meal
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Not Found Alert */}
      <Dialog open={notFound} onClose={() => setNotFound(false)}>
        <DialogTitle>Food Not Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sorry, we couldn’t find nutrition info for "{query}". Please try
            again with another food.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotFound(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
