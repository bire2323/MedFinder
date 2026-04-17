import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    host: true,
    watch: { usePolling: true },
    allowedHosts: ['cellulolytic-nonshredding-kena.ngrok-free.dev', "medfinder.com", "localhost"],
    hmr: {
      host: 'medfinder.com',
      protocol: 'wss',
      port: 443,
    },
  }
});
