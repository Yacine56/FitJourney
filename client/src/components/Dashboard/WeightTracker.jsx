import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  Snackbar,
  Alert,
  Collapse,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

export default function WeightTracker() {
  const [data, setData] = useState([]);
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Fetch logged weights
  async function fetchWeights() {
    const res = await fetch("http://localhost:5000/api/weight", {
      credentials: "include",
    });
    const result = await res.json();
    if (result.items) {
      // Sort by date ascending
      const sorted = result.items.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setData(sorted);
    }
  }

  useEffect(() => {
    fetchWeights();
  }, []);

  // Log new weight
  async function handleLogWeight() {
    if (!weight) return;
    const res = await fetch("http://localhost:5000/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ weight: parseFloat(weight) }),
    });
    const result = await res.json();
    if (result.entry) {
      setMessage("Weight logged successfully!");
      setWeight("");
      setShowForm(false);
      fetchWeights();
    } else {
      setMessage("Failed to log weight.");
    }
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(6px)",
        boxShadow: 3,
        mb: 4,
      }}
    >
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: 2, color: "#18b5a7", fontWeight: "bold" }}
      >
        Weight Progress
      </Typography>

      {/* Weight Chart */}
      {/* Weight Chart */}
<Box sx={{ width: "100%", height: 320 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
      <XAxis
        dataKey="date"
        tickFormatter={(d) =>
          new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        }
        tick={{ fontSize: 13, fill: "#444", fontWeight: 500 }}
      >
        <Label
          value="Date"
          offset={-5}
          position="insideBottom"
          style={{
            fill: "blue",
            fontSize: 16,
            fontWeight: 600,
          }}
        />
      </XAxis>

      <YAxis
        domain={["auto", "auto"]}
        tick={{ fontSize: 13, fill: "#444", fontWeight: 500 }}
      >
        <Label
          value="Weight (lbs)"
          angle={-90}
          position="insideLeft"
          style={{
            textAnchor: "middle",
            fill: "blue",
            fontSize: 16,
            fontWeight: 600,
          }}
        />
      </YAxis>

      <Tooltip
        contentStyle={{
          backgroundColor: "rgba(255,255,255,0.95)",
          border: "1px solid #18b5a7",
          borderRadius: 8,
        }}
        formatter={(value) => [`${value} lbs`, "Weight"]}
        labelFormatter={(d) =>
          new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        }
      />

      <Line
        type="monotone"
        dataKey="weight"
        stroke="#18b5a7"
        strokeWidth={3}
        dot={{ r: 4, fill: "#18b5a7", strokeWidth: 2 }}
        activeDot={{ r: 7, fill: "#18b5a7" }}
      />
    </LineChart>
  </ResponsiveContainer>
</Box>


      {/* Toggle Button */}
      <Box sx={{ textAlign: "center", mt: 2 }}>
        {!showForm ? (
          <Button
            variant="contained"
            sx={{ bgcolor: "#18b5a7", px: 4 }}
            onClick={() => setShowForm(true)}
          >
            Log Today’s Weight
          </Button>
        ) : (
          <Button
            variant="outlined"
            sx={{ px: 4, color: "#18b5a7", borderColor: "#18b5a7" }}
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        )}
      </Box>

      {/* Smooth Transition Form */}
      <Collapse in={showForm}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Grid item xs={6} sm={4} md={3}>
            <TextField
              label="Today's Weight (lbs)"
              fullWidth
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              type="number"
              inputProps={{ step: "0.1" }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{ bgcolor: "#18b5a7", px: 4, py: 1.2 }}
              onClick={handleLogWeight}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Collapse>

      {/* Snackbar */}
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={message.includes("successfully") ? "success" : "error"}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
