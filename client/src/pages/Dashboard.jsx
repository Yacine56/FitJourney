import * as React from "react";
import { styled } from "@mui/material/styles";
import { Box, Grid, Paper } from "@mui/material";

import WeightTracker from "../components/Dashboard/WeightTracker";
import CaloriesChart from "../components/Dashboard/CaloriesChart";
import MealList from "../components/meals/MealList";
import WorkoutList from "../components/workout/WorkoutList";
import MacroRings from "../components/Dashboard/MacroRings";
import CoachSuggestion from "../components/Dashboard/CoachSuggestion";

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
        py: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3, md: 6 },

        display: "flex",
        flexDirection: { xs: "column", xl: "row" },
        gap: { xs: 3, xl: 4 },
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >

      {/* ✅ Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: "1100px",
          mx: "auto",
        }}
      >
        <Grid
          container
          rowSpacing={4}
          columnSpacing={{ xs: 2, sm: 3, md: 4 }}
          justifyContent="center"
          alignItems="stretch"
        >
          <Grid item xs={12} md={6}>
            <Item><CaloriesChart /></Item>
          </Grid>

          <Grid item xs={12} md={6}>
            <Item><WeightTracker /></Item>
          </Grid>

          <Grid item xs={12} md={6}>
            <Item><MealList /></Item>
          </Grid>

          <Grid item xs={12} md={6}>
            <Item><WorkoutList /></Item>
          </Grid>
        </Grid>
      </Box>

      {/* ✅ Sidebar (Macro Rings) — only sticky on XL screens */}
      <Box
        sx={{
          width: { xs: "100%", xl: "360px" },
          position: { xs: "static", xl: "sticky" },
          top: 20,
          flexShrink: 0,
        }}
      >
        <Item>
          <MacroRings />
        </Item>

        {/* AI Coach bubble here in future */}
         <CoachSuggestion /> 
      </Box>
    </Box>
  );
}
