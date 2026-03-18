import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./i18n";
import "./index.css";
import "leaflet/dist/leaflet.css";
import useAuthStore from "./store/UserAuthStore";

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getXsrfToken } from "./api/client";


window.Pusher = Pusher;

// Optional: get token dynamically to avoid stale values
const getAuthToken = () => useAuthStore.getState().token;

window.Echo = new Echo({
  broadcaster: 'reverb',                // ✅ Must be 'pusher'
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080, // use env or fallback to 8080
  forceTLS: false,                       // ✅ Use ws://, not wss://
  enabledTransports: ['ws'],              // Optional: restrict to ws only
  disableStats: true,
  withCredentials: true,

  // Auth endpoint & headers
  authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
  auth: {
    headers: {
      "X-XSRF-TOKEN": getXsrfToken() || "",
      Accept: 'application/json',
    },
  },
});

console.log('Echo connecting to:', {
  host: import.meta.env.VITE_REVERB_HOST || 'localhost',
  port: import.meta.env.VITE_REVERB_PORT || 8080,
  key: import.meta.env.VITE_REVERB_APP_KEY,
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);