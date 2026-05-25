import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxy = {
  "/api": {
    target: "http://localhost:4000",
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  base: "/Habit-Tracker/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
});
