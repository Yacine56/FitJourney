import * as React from "react";
import { styled } from "@mui/material/styles";
import { Box, Grid, Typography, Paper } from "@mui/material";
import WeightTracker from "../components/Dashboard/WeightTracker";
import CaloriesChart from "../components/Dashboard/CaloriesChart";
import MealList from "../components/meals/MealList";
import WorkoutList from "../components/workout/WorkoutList";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "rgba(255,255,255,0.9)",
  padding: theme.spacing(3),
  borderRadius: 16,
  textAlign: "center",
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  backdropFilter: "blur(6px)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

export default function Dashboard() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        py: { xs: 3, md: 6 },
        px: { xs: 2, sm: 4, md: 8 },
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        <Grid
          container
          rowSpacing={4}
          columnSpacing={{ xs: 2, sm: 3, md: 4 }}
          justifyContent="center"
          alignItems="stretch"
        >
          {/* === Calories Chart === */}
          <Grid item xs={12} md={6}>
            <Item>
           
              <CaloriesChart />
            </Item>
          </Grid>

          {/* === Weight Tracker === */}
          <Grid item xs={12} md={6}>
            <Item>
              
              <WeightTracker />
            </Item>
          </Grid>

          {/* === Meal List === */}
          <Grid item xs={12} md={6}>
            <Item>
              
              <MealList />
            </Item>
          </Grid>

          {/* === Workout List === */}
          <Grid item xs={12} md={6}>
            <Item>
            
              <WorkoutList />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
