import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    proxy: {
      // Forward the OAuth start to the backend so the frontend can use a
      // relative "/login" URL in both dev and the deployed single service.
      "/login": "http://127.0.0.1:5000",
    },
  },
});
