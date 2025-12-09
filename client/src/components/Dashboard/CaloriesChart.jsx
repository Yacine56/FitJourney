import { useEffect, useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";


export default function CaloriesChart() {
  const [data, setData] = useState([]);

  async function fetchCalories() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meals`, {
        credentials: "include",
      });
      const result = await res.json();

      if (result.items) {
        // Group calories by date
        const totals = {};
        result.items.forEach((meal) => {
          const date = new Date(meal.createdAt).toISOString().split("T")[0];
          totals[date] = (totals[date] || 0) + meal.calories;
        });

        // Convert, round, and sort chronologically
        const formatted = Object.entries(totals)
          .map(([date, calories]) => ({
            date,
            calories: Math.round(calories),
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Keep only the last 7 days
        const last7 = formatted.slice(-7);

        setData(last7);
      }
    } catch (err) {
      console.error("Failed to fetch meals:", err);
    }
  }

  useEffect(() => {
    fetchCalories();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: 360,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent", // ✅ fully transparent
      }}
    >
      <Typography
        variant="h6"
        align="center"
        sx={{
          mb: 2,
          color: "#18b5a7",
          fontWeight: "bold",
          textShadow: "1px 1px 1px rgba(0,0,0,0.1)",
        }}
      >
        Calories Intake (Last 7 Recorded Days)-------------
      </Typography>

      <Box
        sx={{
          width: "100%",
          height: "100%",
          px: 1,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.length > 0 ? data : [{ date: "", calories: 0 }]}
            margin={{ top: 20, right: 25, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />

            <XAxis
              dataKey="date"
              tickFormatter={(d) =>
                d
                  ? new Date(d).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : ""
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
              tick={{ fontSize: 13, fill: "#444", fontWeight: 500 }}
              allowDecimals={false}
            >
              <Label
                value="Calories"
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
              formatter={(value) => [`${value} kcal`, "Calories"]}
              labelFormatter={(d) =>
                d
                  ? new Date(d).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : ""
              }
            />

            <Bar
              dataKey="calories"
              fill="#f44336"
              barSize={50}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
