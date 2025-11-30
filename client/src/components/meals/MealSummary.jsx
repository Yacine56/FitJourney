import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";

function getLocalDate() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

export default function MealSummary({ refreshKey }) {
  const [goal, setGoal] = useState(2000);
  const [totalCalories, setTotalCalories] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // 🔹 1) Get the SAME macroTargets the dashboard uses
        const dashRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard`,
          { credentials: "include" }
        );
        const dashData = await dashRes.json();
        const calorieGoal = dashData.macroTargets?.calories || 2000;
        setGoal(calorieGoal);

        // 🔹 2) Get today's meals (with timezone offset)
        const today = getLocalDate();
        const tzOffset = new Date().getTimezoneOffset(); // e.g. 360 for UTC-6

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/meals?date=${today}&tzOffset=${tzOffset}`,
          { credentials: "include" }
        );
        const data = await res.json();

        const total = (data.items || []).reduce(
          (sum, m) => sum + (m.calories || 0),
          0
        );
        setTotalCalories(total);

        const calcPercent = Math.min(
          100,
          Math.round((total / calorieGoal) * 100)
        );
        setPercent(calcPercent);
      } catch (err) {
        console.error("Failed to load summary:", err);
      }
    }

    fetchData();
  }, [refreshKey]);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={percent}
          size={140}
          thickness={5}
          sx={{
            color: "#18b5a7",
            transform: "rotate(-90deg)", // start from top
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5">{`${percent}%`}</Typography>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ mt: 2 }}>
        You’ve reached {percent}% of your daily goal of {goal} calories
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Total logged today: {Math.round(totalCalories)} kcal
      </Typography>
    </Box>
  );
}
