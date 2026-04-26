import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, Vite serves the SPA on :5173 while the FastAPI backend runs on
// :8081. Proxy /api/* + /healthz so the frontend can call relative paths
// (e.g. fetch("/api/v1/objectives")) the same way it will in the unified
// Cloud Run deploy. Override the target with VITE_API_TARGET if needed.
const apiTarget = process.env.VITE_API_TARGET || "http://localhost:8081";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/healthz": { target: apiTarget, changeOrigin: true }
    }
  }
});
