
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    // ←←← ADD THIS PROXY CONFIGURATION
    proxy: {
      "/api": {
        target: "https://medfinder-nqdq.onrender.com/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // optional but safe
      },
    },

    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true",
      interval: 1000,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/storage/**",
        "**/.vscode/**",
        "**/.gemini/**",
        "**/eslint_output.json",
        "**/package-lock.json",
        "**/yarn.lock",
        "**/pnpm-lock.yaml",
        "**/*.log",
        "**/.dockerignore",
        "**/Dockerfile*",
        "**/nginx.conf",
      ],
    },

    allowedHosts: [
      "localhost",
      "medfinder.com",
      ".trycloudflare.com",
      "cellulolytic-nonshredding-kena.ngrok-free.dev",
    ],

    hmr: {
      protocol: "wss",
      clientPort: 443,
    },
  },
});

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({
//   plugins: [react(), tailwindcss()],

//   server: {
//     host: "0.0.0.0",
//     port: 5173,

//     watch: {
//       usePolling: process.env.VITE_USE_POLLING === "true",
//       interval: 1000,
//       ignored: [
//         "**/node_modules/**",
//         "**/.git/**",
//         "**/dist/**",
//         "**/build/**",
//         "**/storage/**",
//         "**/.vscode/**",
//         "**/.gemini/**",
//         "**/eslint_output.json",
//         "**/package-lock.json",
//         "**/yarn.lock",
//         "**/pnpm-lock.yaml",
//         "**/*.log",
//         "**/.dockerignore",
//         "**/Dockerfile*",
//         "**/nginx.conf",
//       ],
//     },

//     allowedHosts: [
//       "localhost",
//       "medfinder.com",
//       ".trycloudflare.com",
//       "cellulolytic-nonshredding-kena.ngrok-free.dev",
//     ],

//     hmr: {
//       protocol: "wss",
//       clientPort: 443,
//     },
//   },
// });
