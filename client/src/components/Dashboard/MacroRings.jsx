import { Box, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";

// Ring component
function MacroRing({ label, value, goal, color }) {
  const pct = Math.min(value / goal, 1);
  const circumference = 2 * Math.PI * 45; // radius=45

  return (
    <Box
      sx={{
        textAlign: "center",
        p: 2,
      }}
    >
      {/* Ring */}
      <Box sx={{ position: "relative", width: 120, height: 120, mx: "auto" }}>
        <svg width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="#e0e0e0"
            strokeWidth="10"
            fill="none"
          />

          <circle
            cx="60"
            cy="60"
            r="45"
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - pct * circumference}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>

        {/* Center value */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {value}/{goal}
          </Typography>
        </Box>
      </Box>

      {/* Label */}
      <Typography sx={{ fontWeight: "bold", mt: 1 }}>{label}</Typography>
    </Box>
  );
}

export default function MacroRings() {
  const [macros, setMacros] = useState(null);

  async function loadData() {
    const res = await fetch("http://localhost:5000/api/dashboard", {
      credentials: "include",
    });
    const data = await res.json();
    setMacros({
      totals: data.todaysMacros,
      targets: data.macroTargets,
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!macros) return <Typography>Loading...</Typography>;

  const { totals, targets } = macros;

  const rings = [
    {
      label: "Calories",
      value: Math.round(totals.calories),
      goal: Math.round(targets.calories),
      color: "#ff9800",
    },
    {
      label: "Protein (g)",
      value: Math.round(totals.protein),
      goal: Math.round(targets.protein),
      color: "#4caf50",
    },
    {
      label: "Carbs (g)",
      value: Math.round(totals.carbs),
      goal: Math.round(targets.carbs),
      color: "#2196f3",
    },
    {
      label: "Fats (g)",
      value: Math.round(totals.fats),
      goal: Math.round(targets.fats),
      color: "#e91e63",
    },
  ];

  return (
    <Box sx={{ p: 3, borderRadius: 3 }}>
      <Typography
        variant="h6"
        textAlign="center"
        sx={{ mb: 2, fontWeight: "bold", color: "#18b5a7" }}
      >
        🥗 Daily Macro Rings
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {rings.map((r, i) => (
          <Grid item xs={6} md={3} key={i}>
            <MacroRing {...r} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
