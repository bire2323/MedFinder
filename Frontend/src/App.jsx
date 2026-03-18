import { Toaster } from "react-hot-toast";
import AppRouter from "./App/Router/router";
import { initializeAuth } from "./auth/initAuth";
import { useEffect} from "react";
import { router } from "./App/Router/router";
import { RouterProvider } from "react-router-dom";

export default function App() {
  console.log("App render");
  useEffect(()=>{
    console.log("initialize auth");
    initializeAuth();
  },[]);
  return  <RouterProvider router={router} />
}
