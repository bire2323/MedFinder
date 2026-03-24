import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import BackToTop from "../../component/BackToTop";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";


export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <BackToTop />
      <Outlet />
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 8000,
        }}
      />
    </>
  );
}
