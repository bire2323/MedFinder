
import { Toaster } from "react-hot-toast";
import AppRouter from "./App/Router/router";
import { initializeAuth } from "./auth/initAuth";
import { useEffect } from "react";
import { router } from "./App/Router/router";
import { RouterProvider } from "react-router-dom";
import AuthInitializer from "./auth/AuthInitializer";
import RealTimeNotificationProvider from "./component/RealTimeNotificationProvider";


export default function App() {

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/tile_cache.js")
        .then(() => console.log("SW registered"))
        .catch((err) => console.error("SW failed", err));
    }
  }, []);

  return <>
    <AuthInitializer />
    <RealTimeNotificationProvider />
    <RouterProvider router={router} />
  </>
}
