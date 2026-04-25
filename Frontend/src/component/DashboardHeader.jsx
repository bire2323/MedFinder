import React, { useState } from "react";
import { HiMenuAlt3, HiOutlineLocationMarker } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { FaUser, FaUserCircle, FaMapMarkedAlt } from "react-icons/fa";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { useTranslation } from "react-i18next";

import ThemeToggle from "./DarkLightTeam";
import LanguageSwitcher from "./LanguageSwitcher";
import useAuthStore from "../store/UserAuthStore";
import { navigateByRole } from "../utils/UserNavigation";
import { apiLogout } from "../api/auth";
import am_white from "../assets/am_white.png";
import en_white from "../assets/en_white.png";
import am_black from "../assets/am_black.png";
import en_black from "../assets/en_black.png";

// Custom hook to get current search type


export default function DashboardHeader() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);

    const user = useAuthStore((state) => state.user);
    const roles = useAuthStore((state) => state.roles);
    const isLoading = useAuthStore((state) => state.isLoading);
    const clearSession = useAuthStore((state) => state.clearSession);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        apiLogout().then(() => {
            clearSession();
            navigate("/");
        }).catch(() => {
            clearSession();
            navigate("/");
        });
    };

    // Determine active states

    const params = new URLSearchParams(location.search);
    const searchType = params.get("type");
    const isHomeActive = location.pathname === "/" && !searchType; // exactly /home with no type param
    const isHospitalActive = searchType === "hospital";
    const isPharmacyActive = searchType === "pharmacy";
    const isMapActive = location.pathname === "/map";

    const isAmharic = useTranslation().i18n.language === "am";



    return (
        <header className="sticky top-0 z-[100] w-full bg-white/90 dark:bg-gray-950 backdrop-blur-md border-b border-slate-100 dark:border-gray-800 shadow-sm">
            <div className="max-w-[1780px] mx-auto px-6 lg:px-12">
                <div className="flex justify-between items-center h-14">


                    <div className="flex items-start">
                        <Link
                            to="/"
                            className="flex items-center gap-3 group"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        >
                            <img src={isAmharic ? am_white : en_white} alt={t("headingNav.healthcare_platform")} onClick={() => navigate("/")} className="w-30 sm:w-50 h-14" />


                        </Link>
                    </div>





                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-2">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>
                        {isLoading ? (
                            <div className="hidden lg:flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-all">
                                <FaUserCircle size={32} />
                            </div>
                        ) : !user ? (
                            <div className="hidden lg:flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-gray-800">
                                <button
                                    onClick={() => navigate("/login", { state: { background: location } })}
                                    className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 transition"
                                >
                                    {t("Register.Login")}
                                </button>
                                <button
                                    onClick={() => navigate("/register", { state: { background: location } })}
                                    className="bg-green-800 dark:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 dark:hover:bg-blue-500 transition-all shadow-md active:scale-95"
                                >
                                    {t("Register.join_medFinder")}
                                </button>
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center gap-4 border-l pl-6 border-slate-200 dark:border-gray-800">
                                <div className="hidden xl:flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {t("headingNav.location")}
                                    </span>
                                    <div className="flex items-center gap-1 text-slate-700 dark:text-gray-200">
                                        <HiOutlineLocationMarker className="text-blue-600" />
                                        <span className="text-xs font-bold italic">
                                            {t("headingNav.addis_ababa")}
                                        </span>
                                    </div>
                                </div>

                                <div className="hidden lg:block relative">
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
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setToggleProfileDropDown(false)}
                                            />
                                            <div className="absolute right-0 mt-3 w-64 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 p-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                <div className="px-4 py-3 border-b border-slate-50 dark:border-gray-800 mb-2">
                                                    <p className="text-xs font-bold text-slate-400">
                                                        {t("headingNav.profile_dropdown.account")}
                                                    </p>
                                                    <p className="text-sm font-bold truncate dark:text-white">
                                                        {user?.Email}
                                                    </p>
                                                </div>
                                                <NavLink
                                                    to="#"
                                                    onClick={() => {
                                                        if (roles?.includes("patient")) {
                                                            navigate("/user/dashboard", { replace: true });
                                                        } else {
                                                            navigateByRole(roles, navigate);
                                                        }
                                                    }}
                                                    className="flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                                                >
                                                    <FaUser className="text-blue-500" />
                                                    <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                                                </NavLink>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                >
                                                    <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
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
                        <span className="md:hidden flex gap-1.5">
                            <LanguageSwitcher />

                        </span>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 dark:text-white bg-slate-100 dark:bg-gray-800 rounded-xl"
                        >
                            {isMenuOpen ? <IoMdClose size={24} /> : <HiMenuAlt3 size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE NAV MENU */}
            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] lg:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="fixed inset-0 z-[120] bg-white dark:bg-gray-950 p-6 space-y-6 lg:hidden overflow-y-auto">
                        <div className="pt-16">
                            <div className="flex flex-col gap-4">
                                <Link
                                    to="/"
                                    className={`text-lg font-bold transition-colors ${isHomeActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "dark:text-white text-slate-800"
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("headingNav.home")}
                                </Link>
                                <Link
                                    to="/home/search?type=hospital&q="
                                    className={`text-lg font-bold transition-colors ${isHospitalActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "dark:text-white text-slate-800"
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("headingNav.hospitals")}
                                </Link>
                                <Link
                                    to="/home/search?type=pharmacy&q="
                                    className={`text-lg font-bold transition-colors ${isPharmacyActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "dark:text-white text-slate-800"
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t("headingNav.pharmacies")}
                                </Link>
                            </div>

                            <Link
                                to="/home/map"
                                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold shadow-lg ${isMapActive
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FaMapMarkedAlt /> {t("headingNav.open_live_map")}
                            </Link>

                            {!user ? (
                                <button
                                    onClick={() => {
                                        navigate("/login");
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold"
                                >
                                    {t("Login.Login")}
                                </button>
                            ) : (<>
                                <div className="relative">
                                    <button
                                        className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-all"
                                        onClick={() => setToggleProfileDropDown(!toggleProfileDropDown)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 bg-blue-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600">
                                                <FaUserCircle size={32} />
                                            </div>
                                            <div><span>{user?.Name}</span></div>
                                        </div>
                                    </button>

                                    {toggleProfileDropDown && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setToggleProfileDropDown(false)}
                                            />
                                            <div className="absolute right-0 mt-3 w-64 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 p-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                <div className="px-4 py-3 border-b border-slate-50 dark:border-gray-800 mb-2">
                                                    <p className="text-xs font-bold text-slate-400">
                                                        {t("headingNav.profile_dropdown.account")}
                                                    </p>
                                                    <p className="text-sm font-bold truncate dark:text-white">
                                                        {user?.Email}
                                                    </p>
                                                </div>
                                                <NavLink
                                                    to="#"
                                                    onClick={() => {
                                                        if (roles?.includes("patient")) {
                                                            navigate("/user/dashboard", { replace: true });
                                                        } else {
                                                            navigateByRole(roles, navigate);
                                                        }
                                                    }}
                                                    className="flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                                                >
                                                    <FaUser className="text-blue-500" />
                                                    <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                                                </NavLink>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                >
                                                    <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>)}

                        </div>
                    </div>
                </>
            )}
        </header>
    );
}

