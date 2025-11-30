// src/components/Dashboard/CoachSuggestion.jsx
import { useEffect, useState } from "react";
import { Box, Paper, Typography, IconButton, Avatar } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function CoachSuggestion() {
  const [text, setText] = useState("Loading your daily tip...");
  const [visible, setVisible] = useState(false);

  async function fetchSuggestion() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/ai-suggestion`,
        { credentials: "include" }
      );

      const data = await res.json();
      setText(data.suggestion || "Stay consistent — you're doing great!");
      setVisible(true);
    } catch {
      setText("Keep tracking meals — you're doing great! 💪");
      setVisible(true);
    }
  }

  useEffect(() => {
    fetchSuggestion();
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 20, md: 24 },
        top: { xs: 70, sm: 24 },          // a bit lower on mobile so it doesn’t hit navbar
        zIndex: 2000,
        maxWidth: 300,
        animation: visible ? "fadeIn 0.4s ease-out" : "none",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(-10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          backgroundColor: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Coach avatar instead of robot */}
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#1cb5e0",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          💪
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Daily Coach Tip
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {text}
          </Typography>
        </Box>

        <IconButton size="small" onClick={fetchSuggestion}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
}
