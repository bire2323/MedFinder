import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    watch: {
      usePolling: true,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/storage/**",
      ],
    },

    allowedHosts: [
      "localhost",
      "medfinder.com",
      "cellulolytic-nonshredding-kena.ngrok-free.dev",
    ],

    hmr: {
      protocol: "wss",
      clientPort: 443,
    },
  },
});