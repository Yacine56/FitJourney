// frontend/components/Dashboard/CoachSuggestion.jsx

import { useEffect, useState } from "react";
import { Box, Paper, Typography, IconButton, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SmartToyIcon from "@mui/icons-material/SmartToy";

export default function CoachSuggestion() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);

  async function fetchSuggestion() {
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/ai-suggestion`,
        { credentials: "include" }
      );

      const data = await res.json();

      // If AI returned null → hide component
      if (!data.suggestion) {
        setAvailable(false);
        return;
      }

      setText(data.suggestion);
      setAvailable(true);

    } catch (err) {
      console.error("AI coach error:", err);
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSuggestion();
  }, []);

  // Hide card entirely when AI is unavailable
  if (!available) return null;

  return (
    <Paper
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
      }}
    >
      <SmartToyIcon sx={{ fontSize: 36, color: "#00bcd4", mt: 0.5 }} />

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Coach’s Tip
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Analyzing today’s meals…</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {text}
          </Typography>
        )}
      </Box>

      <IconButton
        onClick={fetchSuggestion}
        size="small"
        sx={{ alignSelf: "flex-start" }}
      >
        <RefreshIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
