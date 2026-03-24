import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    proxy: {
      // ─── Backend API ──────────────────────────────────────────────────────
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // ─── Sanctum CSRF cookie & broadcasting auth ──────────────────────────
      // These MUST be proxied so the browser treats them as same-origin as
      // the Vite dev server (localhost:5173). Without this, cookies set by
      // /sanctum/csrf-cookie are scoped to :8000 and never sent back on
      // subsequent requests to :5173 — causing the 419 CSRF mismatch.
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/broadcasting': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // ─── Reverb WebSocket ─────────────────────────────────────────────────
      '/reverb': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    }
  }
});
