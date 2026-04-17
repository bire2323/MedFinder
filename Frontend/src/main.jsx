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
  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: 'medfinder.com',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],

    authEndpoint: '/api/broadcasting/auth',

    wsPath: '/reverb',

    auth: {
      withCredentials: true,
    },
  });



  // Now render the app – Echo is guaranteed to be ready
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();