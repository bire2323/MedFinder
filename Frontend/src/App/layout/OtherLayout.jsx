import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import ScrollToTop from "../../component/ScrollToTop";

export default function OtherLayout() {
  return (
    <>

      <Outlet />
    </>
  );
}
