import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = process.env.VITE_API_URL || "http://localhost:5000";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: backend,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
