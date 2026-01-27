import React, { useState } from "react";
import { HiMenuAlt3, HiOutlineLocationMarker } from "react-icons/hi";

import { IoMdClose } from "react-icons/io";
import {
  FaHospitalSymbol,
  FaPills,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";

import { Link, NavLink } from "react-router-dom";
import { FaMapMarkedAlt } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { AiFillProduct } from "react-icons/ai";
import ThemeToggle from "./DarkLightTeam";
import { useNavigate, useLocation } from "react-router-dom";


import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);
 
  const navigate = useNavigate();
  const location = useLocation();

 
  const handleProfileClick = () => {
    setToggleProfileDropDown(!toggleProfileDropDown);
  };
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <FaHospitalSymbol className="text-white text-xl" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Med<span className="text-blue-500 dark:text-blue-300">Fi</span>
                nder
              </span>
              <span className="text-[10px] text-slate-500 dark:text-white/75 font-medium uppercase tracking-widest">
                {t("heading.hospital_and_pharmacy_finder")}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-semibold text-slate-600 dark:text-white hover:text-blue-600 transition"
            >
              {t("headingNav.home")}
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-slate-600 dark:text-white hover:text-blue-600 transition"
            >
              {t("headingNav.hospitals")}
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-slate-600 dark:text-white hover:text-blue-600 transition"
            >
              {t("headingNav.pharmacies")}
            </a>
            <div
              className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-white bg-emerald-50 dark:bg-gray-500 px-3 py-1 rounded-full border
            cursor-pointer border-emerald-100 dark:border-0"
            >
              <FaMapMarkedAlt />
              <Link to="/map">{t("headingNav.map")}</Link>
            </div>
          </nav>

          {/* 3. RIGHT SECTION (Location & Profile) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => {
                navigate('/login', { state: { background: location } });
              }}
              className="text-sm font-semibold text-slate-600 dark:text-white hover:text-blue-600 transition px-3 py-1 rounded"
            >
              Login
            </button>

            <button
              onClick={() => {
                navigate('/register', { state: { background: location } });
              }}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded"
            >
              Register
            </button>

            <div className="flex items-center gap-1 text-slate-500 border-r pr-4 border-slate-200">
              <HiOutlineLocationMarker className="text-blue-600" />
              <span className="text-xs font-medium dark:text-white">
                Addis ababa, NY
              </span>
            </div>

            <button
              className="p-1 text-slate-400 dark:text-white hover:text-blue-600 transition"
              onClick={handleProfileClick}
            >
              <FaUserCircle size={28} />
            </button>
            {toggleProfileDropDown && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setToggleProfileDropDown(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute z-20  top-[75px] right-8  bg-cyan-700 dark:bg-gray-800 shadow-2xl rounded-lg"
                >
                  <ul
                    className={` bg-cyan-700 cursor-pointer dark:bg-gray-800 shadow-2xl`}
                  >
                    {true && (
                      <li className="px-3 py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm leading-5 font-medium text-white">
                            sign_in_as
                          </p>
                          <p className="text-sm leading-5 text-gray-300 truncate">
                            {/* {user.u_email} */}
                          </p>
                        </div>
                        <NavLink
                          className="flex items-start justify-start  gap-x-2 pt-2"
                          to={"/user/dashboard"}
                          onClick={handleProfileClick}
                        >
                          {" "}
                          <FaUser className="w-4 h-4" />
                          <span className="text-[14px] text-gray-300 sm:text-sm ">
                            {" "}
                            My Profile
                          </span>
                        </NavLink>
                      </li>
                    )}

                    <li className="px-3 py-2 text-white ">
                      <NavLink
                        className="flex items-start justify-start  gap-x-2"
                        to={"/home"}
                        onClick={handleProfileClick}
                      >
                        {" "}
                        <AiFillProduct className="w-4 h-4" />
                        <span className="text-[14px] sm:text-sm ">
                          Go To Home
                        </span>
                      </NavLink>
                    </li>
                    <li
                      className="cursor-pointer px-4 py-2 text-white "
                      onClick={handleProfileClick}
                    >
                      <NavLink
                        className="flex items-start justify-start gap-x-2"
                        // onClick={handleLogoutCLick}
                      >
                        <LuLogOut className="w-4 h-4" />
                        <span className="text-[14px] sm:text-sm ">Logout</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

         
        

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600"
            >
              {isMenuOpen ? <IoMdClose size={28} /> : <HiMenuAlt3 size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-4">
            <a
              href="#"
              className="flex flex-col items-center p-4 bg-slate-50 rounded-xl"
            >
              <FaHospitalSymbol className="text-blue-600 mb-2" />
              <span className="text-xs font-bold">Hospitals</span>
            </a>
            <a
              href="#"
              className="flex flex-col items-center p-4 bg-slate-50 rounded-xl"
            >
              <FaPills className="text-emerald-600 mb-2" />
              <span className="text-xs font-bold">Pharmacies</span>
            </a>
          </div>
          <a
            href="#"
            className="block py-3 px-4 text-center bg-blue-600 text-white rounded-xl font-bold"
          >
            Find on Map
          </a>
          <div className="flex justify-center items-center gap-2 py-2 text-slate-500 border-t">
            <button
              onClick={() => {
                navigate('/login', { state: { background: location } });
              }}
              className="text-sm font-semibold text-slate-600 dark:text-white hover:text-blue-600 transition px-3 py-1 rounded"
            >
              Login
            </button>

            <button
              onClick={() => {
                navigate('/register', { state: { background: location } });
              }}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
