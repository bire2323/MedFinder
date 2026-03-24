import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./i18n";
import "./index.css";
import "leaflet/dist/leaflet.css";
import useAuthStore from "./store/UserAuthStore";

import Pusher from 'pusher-js';
window.Pusher = Pusher;

import Echo from 'laravel-echo';

import { getXsrfToken, ensureCsrfCookie } from "./api/client";

// Initialize Echo only after CSRF cookie is present.
// IMPORTANT: getXsrfToken() MUST be called AFTER ensureCsrfCookie() resolves.
// Calling it before leaves it empty → Echo sends a blank X-XSRF-TOKEN → 419.
(async () => {
  try {
    await ensureCsrfCookie();
  } catch (e) {
    console.warn('Failed to fetch CSRF cookie before Echo init', e);
  }

  // Read the XSRF token AFTER the cookie has been set by the server
  const xsrfToken = getXsrfToken();

  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
    forceTLS: false,
    enabledTransports: ['ws'],
    disableStats: true,
    withCredentials: true,

    // Use a RELATIVE path — goes through the Vite proxy (same-origin).
    // An absolute http://localhost:8000 URL is cross-origin from localhost:5173,
    // so the browser will not attach the laravel_session or XSRF-TOKEN cookies,
    // causing a 419 on /broadcasting/auth.
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: {
        "X-XSRF-TOKEN": xsrfToken || "",
        Accept: "application/json",
      }
    },
    cluster: '',
  });

  // console.log('Echo initialized. XSRF token present:', !!xsrfToken);
  //console.log('Echo connecting to:', {
  // host: import.meta.env.VITE_REVERB_HOST || 'localhost',
  // port: import.meta.env.VITE_REVERB_PORT || 8080,
  // key: import.meta.env.VITE_REVERB_APP_KEY,
  // });
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);