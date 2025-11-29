import { useEffect, useState } from "react";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SmartToyIcon from "@mui/icons-material/SmartToy";

export default function CoachSuggestion() {
  const [text, setText] = useState("Loading suggestion...");
  const [visible, setVisible] = useState(false);

  async function fetchSuggestion() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/ai-suggestion`, {
  credentials: "include",
});

let data;
try {
  data = await res.json();
} catch {
  setText("AI coach unavailable, keep grinding 💪");
  return;
}

    setText(data.suggestion || "Keep it up!");
    setVisible(true);
  }

  useEffect(() => {
    fetchSuggestion();
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        right: 20,
        top: 100,
        width: 260,
        zIndex: 999,
        animation: visible ? "popIn .4s ease-out" : "none",
        "@keyframes popIn": {
          "0%": { opacity: 0, transform: "translateX(30px) scale(0.95)" },
          "100%": { opacity: 1, transform: "translateX(0) scale(1)" },
        },
      }}
    >
      <Paper sx={{ p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <SmartToyIcon sx={{ fontSize: 40, color: "#00bcd4" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Coach's Tip
          </Typography>
          <Typography variant="body2">{text}</Typography>
        </Box>
        <IconButton onClick={fetchSuggestion} size="small">
          <RefreshIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
