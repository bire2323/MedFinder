import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import BackToTop from "../../component/BackToTop";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../component/ScrollToTop";


export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <ScrollToTop />
      <BackToTop />
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 8000,
          style: {
            zIndex: 9999
          }
        }}
      />
    </>
  );
}
