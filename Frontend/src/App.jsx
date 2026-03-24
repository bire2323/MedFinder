import { Toaster } from "react-hot-toast";
import AppRouter from "./App/Router/router";
import { initializeAuth } from "./auth/initAuth";
import { useEffect } from "react";
import { router } from "./App/Router/router";
import { RouterProvider } from "react-router-dom";
import AuthInitializer from "./auth/AuthInitializer";

export default function App() {

  return <>
    <AuthInitializer />
    <RouterProvider router={router} />
  </>
}
