import React from "react";
import ReactDOM from "react-dom/client";
import { router } from "./app/router/router";
import { RouterProvider } from "react-router-dom";
import "./i18n";

import "./index.css";
import "leaflet/dist/leaflet.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
