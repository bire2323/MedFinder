import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import BackToTop from "../../component/BackToTop";
import { useLocation,useNavigate } from "react-router-dom";


export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <BackToTop />
      <Outlet />
     
    </>
  );
}
