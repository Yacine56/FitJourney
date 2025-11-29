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
  Tooltip,
  Fade,
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
      `${import.meta.env.VITE_API_URL}/api/meals/search?query=${query}`,
      { credentials: "include" }
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
      {/* Title */}
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
      >
        Search for a Meal 🍎
      </Typography>

      {/* Search + Custom button row */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", flexGrow: 1, gap: "8px" }}
        >
          <TextField
            label="Search Your Meal"
            placeholder="e.g., 200 g chicken, 1 cup rice and 2 bananas"
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

        <Tooltip title="Manually enter your own meal values">
          <Button
            variant="outlined"
            sx={{ minWidth: "150px", whiteSpace: "nowrap" }}
            onClick={onAddCustom}
          >
            + Create Custom Meal
          </Button>
        </Tooltip>
      </Box>

      {/* Note */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, mb: 1.5, display: "block" }}
      >
        Default serving: 100 g or 1 cup (you can specify amounts like “250 g rice”
        or “2 bananas”).
      </Typography>
{/* Results */}
<Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
  {results.map((item, idx) => {

    // ✅ Format title like "2 bananas" or "150 g chicken"
    const qty = item.quantity && item.unit
      ? `${item.quantity} ${item.unit}`
      : "";

    // mealName already cleaned by AI
    const header = qty ? `${qty} ${item.mealName}` : item.mealName;

    return (
      <Fade in={true} timeout={400 + idx * 100} key={idx}>
        <Grid item>
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
                sx={{ bgcolor: "#18b5a7", borderRadius: "20px", px: 3 }}
                onClick={async () => {
                  await fetch(`${import.meta.env.VITE_API_URL}/api/meals`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      ...item,
                      mealName: header, // ✅ save clean formatted name
                    }),
                  });
                  onLog("Meal logged successfully!");
                }}
              >
                Log Meal
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Fade>
    );
  })}
</Grid>


      {/* Not Found Alert */}
      <Dialog open={notFound} onClose={() => setNotFound(false)}>
        <DialogTitle>Food Not Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sorry, we couldn’t find nutrition info for “{query}”. Please try
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
