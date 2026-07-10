import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true, // यहाँ स्ट्रिंग हटाकर सीधे true लिख दिया है
    proxy: {
      "/api": {
        target: "https://aeromind-drone-simulator.onrender.com",
        changeOrigin: true,
      },
    },
  },
});