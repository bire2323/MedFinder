import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./index.css";
import "leaflet/dist/leaflet.css";
import Echo from 'laravel-echo';
import Pusher from "pusher-js";
import { ensureCsrfCookie } from "./api/client"; // No need to import getXsrfToken

window.Pusher = Pusher;

(async () => {
  try {
    await ensureCsrfCookie(); // Sets XSRF-TOKEN cookie
  } catch (e) {
    console.warn('Failed to fetch CSRF cookie before Echo init', e);
  }
  const isSecure = window.location.protocol === 'https:';
  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: isSecure ? 443 : 80,
    wssPort: isSecure ? 443 : 80,
    forceTLS: isSecure,
    enabledTransports: ['ws', 'wss'],

    authEndpoint: '/broadcasting/auth',

    wsPath: import.meta.env.VITE_REVERB_PATH || '/reverb',

    auth: {
      withCredentials: true,
    },
  });



  // Now render the app – Echo is guaranteed to be ready
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();