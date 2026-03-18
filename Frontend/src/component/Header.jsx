import React, { useState } from "react";
import { HiMenuAlt3, HiOutlineLocationMarker } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { FaHospitalSymbol, FaPills, FaUser, FaUserCircle, FaMapMarkedAlt } from "react-icons/fa";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { AiFillProduct } from "react-icons/ai";
import { useTranslation } from "react-i18next";

import ThemeToggle from "./DarkLightTeam";
import LanguageSwitcher from "./LanguageSwitcher";
import useAuthStore from "../store/UserAuthStore";
import {navigateByRole} from "../utils/UserNavigation";
import { apiLogout } from "../api/auth";

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);

  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  //console.log(roles);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    apiLogout().then(() => {
      clearSession();
      navigate("/");
    });
  };

  // Helper for NavLink styles
  const navLinkClass = ({ isActive }) => 
    `text-sm font-bold transition-all duration-200 hover:text-blue-600 ${
      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-gray-300"
    }`;

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/90 dark:bg-gray-950 backdrop-blur-md border-b border-slate-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. BRAND LOGO */}
          <div className="flex items-center">
            <Link 
              to='/' 
              className="flex items-center gap-3 group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <FaHospitalSymbol className="text-white text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Med<span className="text-blue-600">Finder</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Healthcare Platform
                </span>
              </div>
            </Link>
          </div>

          {/* 2. CENTRAL NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-10">
            <NavLink to="/home" className={navLinkClass}>{t("headingNav.home")}</NavLink>
            <NavLink to="/hospitals" className={navLinkClass}>{t("headingNav.hospitals")}</NavLink>
            <NavLink to="/pharmacies" className={navLinkClass}>{t("headingNav.pharmacies")}</NavLink>
            
            <NavLink 
              to="/map" 
              className="flex items-center gap-2 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 transition-all"
            >
              <FaMapMarkedAlt />
              {t("headingNav.map")}
            </NavLink>
          </nav>

          {/* 3. RIGHT ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            
            <div className="flex items-center gap-2 mr-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {!user ? (
              <div className="flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-gray-800">
                <button
                  onClick={() => navigate('/login', { state: { background: location } })}
                  className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 transition"
                >
                 {t("Register.Login")}
                </button>
                <button
                  onClick={() => navigate('/register', { state: { background: location } })}
                  className="bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md active:scale-95"
                >
                 {t("Register.join_medFinder")} 
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l pl-6 border-slate-200 dark:border-gray-800">
                <div className="hidden xl:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Your Location</span>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-gray-200">
                    <HiOutlineLocationMarker className="text-blue-600" />
                    <span className="text-xs font-bold italic">Addis Ababa</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-all"
                    onClick={() => setToggleProfileDropDown(!toggleProfileDropDown)}
                  >
                    <div className="w-9 h-9 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600">
                       <FaUserCircle size={32} />
                    </div>
                  </button>

                  {toggleProfileDropDown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setToggleProfileDropDown(false)} />
                      <div className="absolute right-0 mt-3 w-64 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 p-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 dark:border-gray-800 mb-2">
                          <p className="text-xs font-bold text-slate-400 uppercase">Account</p>
                          <p className="text-sm font-bold truncate dark:text-white">{user?.email}</p>
                        </div>
                        <NavLink to="#" onClick={()=>navigateByRole(roles,navigate)} className="flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                          <FaUser className="text-blue-500" /><span > My Dashboard</span>
                        </NavLink>
                        <button onClick={handleLogout} className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                          <LuLogOut /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-white bg-slate-100 dark:bg-gray-800 rounded-xl">
              {isMenuOpen ? <IoMdClose size={24} /> : <HiMenuAlt3 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV MENU */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-950 border-t border-slate-100 dark:border-gray-800 p-6 space-y-6">
          <div className="flex flex-col gap-4">
            <Link to="/home" className="text-lg font-bold dark:text-white">Find Care</Link>
            <Link to="/hospitals" className="text-lg font-bold dark:text-white">Hospitals</Link>
            <Link to="/pharmacies" className="text-lg font-bold dark:text-white">Pharmacies</Link>
          </div>
          <Link to="/map" className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200">
            <FaMapMarkedAlt /> Open Live Map
          </Link>
          {!user && (
             <button onClick={() => navigate('/login')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">{t("Register.login")}</button>
          )}
        </div>
      )}
    </header>
  );
}