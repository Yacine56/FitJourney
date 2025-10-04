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
        const userRes = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });
        const userData = await userRes.json();
        const calorieGoal = userData.user?.dailyCalorieGoal || 2000;
        setGoal(calorieGoal);

        const today = getLocalDate();
        const res = await fetch(`http://localhost:5000/api/meals?date=${today}`, {
          credentials: "include",
        });
        const data = await res.json();

        const total = (data.items || []).reduce((sum, m) => sum + m.calories, 0);
        setTotalCalories(total);

        const calcPercent = Math.min(100, Math.round((total / calorieGoal) * 100));
        setPercent(calcPercent);
      } catch (err) {
        console.error("Failed to load summary:", err);
      }
    }
    fetchData();
  }, [refreshKey]); // 🔹 updates whenever refreshKey changes

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
        Total logged today: {totalCalories.toFixed(2)} kcal
      </Typography>
    </Box>
  );
}
