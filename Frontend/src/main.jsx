
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./i18n";
import "./index.css";
import "leaflet/dist/leaflet.css";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

import {
  ensureCsrfCookie,
  getXsrfToken,
} from "./api/client";

window.Pusher = Pusher;

(async () => {
  try {
    // Get Laravel CSRF cookie
    await ensureCsrfCookie();

    window.Echo = new Echo({
      broadcaster: "reverb",

      key: import.meta.env.VITE_REVERB_APP_KEY,

      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT),

      forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",

      enabledTransports: ["ws", "wss"],

      authorizer: (channel) => {
        return {
          authorize: async (socketId, callback) => {
            try {
              const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/broadcasting/auth`,
                {
                  method: "POST",

                  credentials: "include",

                  headers: {
                    Accept: "application/json",
                    "Content-Type":
                      "application/x-www-form-urlencoded",
                    "X-Requested-With":
                      "XMLHttpRequest",
                    "X-XSRF-TOKEN":
                      getXsrfToken(),
                  },

                  body: new URLSearchParams({
                    socket_id: socketId,
                    channel_name: channel.name,
                  }),
                }
              );

              if (!response.ok) {
                const text =
                  await response.text();

                console.error(
                  "Broadcast auth failed",
                  response.status,
                  text
                );

                callback(true, text);

                return;
              }

              const data =
                await response.json();

              callback(false, data);
            } catch (error) {
              console.error(error);

              callback(true, error);
            }
          },
        };
      },
    });

    ReactDOM.createRoot(
      document.getElementById("root")
    ).render(<App />);
  } catch (e) {
    console.error(e);
  }
})();
