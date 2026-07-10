import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      "aeromind-drone-simulator-1.onrender.com"
    ],
    proxy: {
      "/api": {
        target: "https://aeromind-drone-simulator.onrender.com",
        changeOrigin: true,
      },
    },
  },
});