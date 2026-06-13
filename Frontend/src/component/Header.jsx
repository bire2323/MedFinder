import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiMenuAlt3, HiOutlineLocationMarker } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { FaUser, FaUserCircle, FaMapMarkedAlt } from "react-icons/fa";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { ChevronDown, Stethoscope, LayoutGrid, FileScan, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import ThemeToggle from "./DarkLightTeam";
import LanguageSwitcher from "./LanguageSwitcher";
import { createPortal } from "react-dom";
import useAuthStore from "../store/UserAuthStore";
import { navigateByRole, resolveBackgroundLocation } from "../utils/UserNavigation";
import { apiLogout } from "../api/auth";
import am_white from "../assets/am_white.png";
import en_white from "../assets/en_white.png";

import useLocationStore from "../store/useLocationStore";

function FindCareLinkRows({ onNavigate, variant = "desktop" }) {
  const { t } = useTranslation();
  const baseRow =
    variant === "desktop"
      ? "flex gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 dark:text-gray-200 dark:hover:bg-emerald-950/50"
      : "flex gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-emerald-50 dark:text-white dark:hover:bg-emerald-950/40";

  const items = [
    {
      to: "/search-department-service#nav-departments",
      title: t("headingNav.findCareDepartments"),
      hint: t("headingNav.findCareDepartmentsHint"),
      Icon: Stethoscope,
    },
    {
      to: "/search-department-service#nav-services",
      title: t("headingNav.findCareServices"),
      hint: t("headingNav.findCareServicesHint"),
      Icon: LayoutGrid,
    },
    {
      to: "/prescription-reader",
      title: t("headingNav.findCarePrescription"),
      hint: t("headingNav.findCarePrescriptionHint"),
      Icon: FileScan,
    },
  ];

  return (
    <ul className="py-1 space-y-0.5">
      {items.map(({ to, title, hint, Icon }) => (
        <li key={to}>
          <Link
            to={to}
            className={baseRow}
            onClick={() => onNavigate?.()}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-tight">{title}</span>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-gray-400 font-normal truncate">{hint}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);
  const [findCareOpen, setFindCareOpen] = useState(false);
  const [mobileFindCareOpen, setMobileFindCareOpen] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [permissionAlertMessage, setPermissionAlertMessage] = useState("");

  const findCareRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileProfileMenuRef = useRef(null); // Separate reference created for mobile drawer wrapper

  const {
    locationName,
    setLocation,
    detectLocation,
    coordinates,
    permissionState,
    permissionError
  } = useLocationStore();
  const [isDetecting, setIsDetecting] = useState(false);
  console.log(coordinates);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!coordinates) {
      handleDetectLocation();
    }
  }, []);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      await detectLocation();
      setIsEditingLocation(false);
    } catch (err) {
      console.error("Auto-detection failed:", err);
      setShowPermissionAlert(true);
      setPermissionAlertMessage(
        err.message || "Unable to detect location. Location features are disabled."
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const checkLocationPermissionBeforeNavigate = (targetPath) => {
    if (permissionState === "denied") {
      alert("you are not grant location and Location Features Stop Working");
      setShowPermissionAlert(true);
      setPermissionAlertMessage(
        "you are not grant location and Location Features Stop Working"
      );
      return false;
    }

    if (!coordinates) {
      alert("you are not grant location and Location Features Stop Working");
      setShowPermissionAlert(true);
      setPermissionAlertMessage(
        "you are not grant location and Location Features Stop Working"
      );
      return false;
    }

    navigate(targetPath);
    return true;
  };

  const handleLocationSubmit = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      if (newLocationName.trim()) {
        setLocation(newLocationName.trim(), null);
      }
      setIsEditingLocation(false);
    }
  };

  const handleLogout = () => {
    apiLogout()
      .then(() => {
        clearSession();
        navigate("/");
      })
      .catch(() => {
        clearSession();
        navigate("/");
      });
  };

  const params = new URLSearchParams(location.search);
  const searchType = params.get("type");
  const isHomeActive = location.pathname === "/" && !searchType;
  const isHospitalActive = searchType === "hospital";
  const isPharmacyActive = searchType === "pharmacy";
  const isMapActive = location.pathname === "/home/map";
  const isFindCareSection =
    location.pathname === "/search-department-service" || location.pathname === "/prescription-reader";

  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const clearSession = useAuthStore((state) => state.clearSession);
  const initialized = useAuthStore((state) => state.initialized);

  const isAmharic = useTranslation().i18n.language === "am";
  const closeFindCare = useCallback(() => setFindCareOpen(false), []);
  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
    setMobileFindCareOpen(false);
  }, []);

  useEffect(() => {
    if (!findCareOpen) return;
    const onPointerDown = (e) => {
      if (findCareRef.current && !findCareRef.current.contains(e.target)) {
        setFindCareOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [findCareOpen]);

  // Refactored unified logic checker to support both desktop and mobile containers concurrently
  useEffect(() => {
    if (!toggleProfileDropDown) return;
    const handleOutsideClick = (e) => {
      const clickedDesktopProfile = profileMenuRef.current && profileMenuRef.current.contains(e.target);
      const clickedMobileProfile = mobileProfileMenuRef.current && mobileProfileMenuRef.current.contains(e.target);

      if (!clickedDesktopProfile && !clickedMobileProfile) {
        setToggleProfileDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [toggleProfileDropDown]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setFindCareOpen(false);
        setMobileFindCareOpen(false);
        setToggleProfileDropDown(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const linkClass = (isActive) =>
    `shrink-0 text-xs font-bold transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 sm:text-sm ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-gray-300"
    }`;

  const openFindCareMenu = () => {
    setToggleProfileDropDown(false);
    setFindCareOpen((o) => !o);
  };

  const openProfileMenu = () => {
    setFindCareOpen(false);
    setToggleProfileDropDown((o) => !o);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto max-w-[1780px] px-3 sm:px-4 md:px-6 lg:px-10 xl:px-12">
        <div className="flex min-h-[4rem] items-center justify-between gap-2 py-2 sm:min-h-[4.5rem] sm:gap-3 lg:min-h-[5rem]">
          {/* Brand */}
          <div className="flex min-w-0 shrink-0 items-center">
            <Link
              to="/"
              className="group flex max-w-[min(200px,52vw)] items-center gap-2 sm:max-w-[220px] md:max-w-none"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                closeMobileMenu();
              }}
            >
              <img
                src={isAmharic ? am_white : en_white}
                alt={t("headingNav.healthcare_platform")}
                className="h-9 w-auto max-w-full object-contain object-left sm:h-10 md:h-11"
              />
            </Link>
          </div>

          {/* Center nav — tablet+ */}
          <nav className="hidden min-w-0 flex-1 justify-center px-1 md:flex lg:px-2">
            <div className="flex max-w-full items-center gap-2 flex-wrap sm:gap-3 md:gap-4 lg:gap-8 xl:gap-10">
              <Link to="/" className={linkClass(isHomeActive)} onClick={closeFindCare}>
                {t("headingNav.home")}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  closeFindCare();
                  checkLocationPermissionBeforeNavigate("/home/search?type=hospital&q=");
                }}
                className={linkClass(isHospitalActive)}
                title={permissionState === "denied" ? "Location permission required" : ""}
              >
                {t("headingNav.hospitals")}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  closeFindCare();
                  checkLocationPermissionBeforeNavigate("/home/search?type=pharmacy&q=");
                }}
                className={linkClass(isPharmacyActive)}
                title={permissionState === "denied" ? "Location permission required" : ""}
              >
                {t("headingNav.pharmacies")}
              </button>

              <div className="relative shrink-0" ref={findCareRef}>
                <button
                  type="button"
                  aria-expanded={findCareOpen}
                  aria-haspopup="true"
                  aria-controls="find-care-desktop-menu"
                  id="find-care-desktop-trigger"
                  onClick={openFindCareMenu}
                  className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-bold transition-all duration-200 sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-sm ${findCareOpen || isFindCareSection
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                    }`}
                >
                  {t("headingNav.findCareMenu")}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ease-out ${findCareOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                <div
                  id="find-care-desktop-menu"
                  role="menu"
                  aria-labelledby="find-care-desktop-trigger"
                  className={`absolute left-1/2 top-full z-[120] mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 origin-top transform rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-200 ease-out dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10 ${findCareOpen
                    ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 scale-95 opacity-0"
                    }`}
                >
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-gray-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                      {t("headingNav.Find Care")}
                    </p>
                  </div>
                  <FindCareLinkRows onNavigate={closeFindCare} variant="desktop" />
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  closeFindCare();
                  checkLocationPermissionBeforeNavigate("/home/map");
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${isMapActive
                  ? "border-emerald-500 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-600"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                  }`}
                title={permissionState === "denied" ? "Location permission required for map" : ""}
              >
                <FaMapMarkedAlt className="shrink-0" />
                <span>{t("headingNav.map")}</span>
              </button>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-1.5 border-r border-slate-200 pr-2 dark:border-gray-800 md:gap-2 md:pr-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {!initialized ? (
              <div className="hidden items-center rounded-full p-1 hover:bg-slate-100 dark:hover:bg-gray-800 md:flex">
                <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
            ) : isLoading ? (
              <div className="hidden items-center rounded-full p-1 hover:bg-slate-100 dark:hover:bg-gray-800 md:flex">
                <FaUserCircle size={28} className="text-slate-500 dark:text-gray-400" />
              </div>
            ) : !user ? (
              <div className="hidden items-center gap-2 md:flex md:gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/login", { state: { background: resolveBackgroundLocation(location) } })}
                  className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 transition hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 sm:px-3 sm:text-sm"
                >
                  {t("Register.Login")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register", { state: { background: resolveBackgroundLocation(location) } })}
                  className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:px-4 sm:text-sm"
                >
                  {t("Register.join_medFinder")}
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex md:gap-4">
                <div className="hidden flex-col items-end lg:flex">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 dark:text-gray-500">
                    {t("headingNav.location")}
                  </span>
                  <div
                    className="group flex cursor-pointer items-center gap-1 text-slate-700 dark:text-gray-200"
                    onClick={() => {
                      setIsEditingLocation(true);
                      setNewLocationName(locationName);
                    }}
                  >
                    <HiOutlineLocationMarker className="text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400" />
                    {isEditingLocation ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          onKeyDown={handleLocationSubmit}
                          onBlur={() => {
                            setTimeout(() => setIsEditingLocation(false), 200);
                          }}
                          className="w-24 border-b border-emerald-500 bg-slate-100 px-1 text-xs font-bold italic text-slate-800 outline-none dark:bg-gray-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetectLocation();
                          }}
                          className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                          title="Detect my location"
                        >
                          {isDetecting ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          ) : (
                            <FaMapMarkedAlt className="text-[10px]" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="max-w-[7rem] truncate text-xs font-bold italic transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {locationName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-slate-100 dark:hover:bg-gray-800"
                    onClick={openProfileMenu}
                    aria-expanded={toggleProfileDropDown}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 sm:h-9 sm:w-9">
                      <FaUserCircle className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                  </button>

                  {toggleProfileDropDown && (
                    <div className="absolute right-0 z-[120] mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all duration-200 animate-in fade-in zoom-in dark:border-gray-800 dark:bg-gray-900">
                      <div className="mb-2 border-b border-slate-50 px-4 py-3 dark:border-gray-800">
                        <p className="text-xs font-bold text-slate-400">{t("headingNav.profile_dropdown.account")}</p>
                        <p className="truncate text-sm font-bold dark:text-white">{user?.email}</p>
                      </div>
                      {user.status === "inactive" ? (
                        <p className="px-4 py-3 text-sm text-red-500">{t("headingNav.profile_dropdown.inactive")}</p>
                      ) : (
                        <NavLink
                          to="#"
                          onClick={() => {
                            if (roles?.includes("patient")) {
                              navigate("/user/dashboard", { replace: true });
                            } else {
                              navigateByRole(roles, navigate);
                            }
                            setToggleProfileDropDown(false);
                          }}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <FaUser className="text-emerald-600" />
                          <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                        </NavLink>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile / compact: lang, theme, menu */}
            <div className="flex md:hidden items-center gap-1 sm:gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((o) => !o);
                setFindCareOpen(false);
              }}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-white dark:hover:bg-gray-800 md:hidden"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? t("common.close") : t("headingNav.openMenu")}
            >
              {isMenuOpen ? <IoMdClose size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ====================== MOBILE MENU - Left Slider Slide-in & Decreased Sizing ====================== */}
      {typeof document !== "undefined" && createPortal(
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] md:hidden transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={closeMobileMenu}
          />

          {/* Left Sliding Menu Panel with independent scrolling layout */}
          <div
            className={`fixed left-0 top-0 bottom-0 max-w-xs w-full bg-white dark:bg-gray-950 p-5 overflow-y-auto z-[10000] md:hidden shadow-2xl border-r border-slate-100 dark:border-gray-900 flex flex-col transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/* Slider Top Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-gray-900">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">MedFinder</span>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900"
              >
                <IoMdClose size={18} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-5">
              {/* Minimized Navigation Links Text */}
              <div className="space-y-0.5">
                <Link
                  to="/"
                  className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${isHomeActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : "text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-gray-900"
                    }`}
                  onClick={closeMobileMenu}
                >
                  {t("headingNav.home")}
                </Link>

                <button
                  onClick={() => {
                    closeMobileMenu();
                    checkLocationPermissionBeforeNavigate("/home/search?type=hospital&q=");
                  }}
                  className={`block w-full text-left rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${isHospitalActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : "text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-gray-900"
                    }`}
                >
                  {t("headingNav.hospitals")}
                </button>

                <button
                  onClick={() => {
                    closeMobileMenu();
                    checkLocationPermissionBeforeNavigate("/home/search?type=pharmacy&q=");
                  }}
                  className={`block w-full text-left rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${isPharmacyActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : "text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-gray-900"
                    }`}
                >
                  {t("headingNav.pharmacies")}
                </button>
              </div>

              {/* Find Care Block with Layout-Safe Dropdown Streaming */}
              <div className="rounded-2xl border border-slate-100 dark:border-gray-900 bg-slate-50/50 dark:bg-gray-900/40 overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-gray-900 transition-colors"
                  onClick={() => setMobileFindCareOpen((o) => !o)}
                  aria-expanded={mobileFindCareOpen}
                >
                  <span className="text-xs tracking-wide">{t("headingNav.findCareMenu")}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 ${mobileFindCareOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {mobileFindCareOpen && (
                  <div className="px-1.5 pb-2 border-t border-slate-100 dark:border-gray-900 bg-white dark:bg-gray-950">
                    <FindCareLinkRows onNavigate={closeMobileMenu} variant="mobile" />
                  </div>
                )}
              </div>

              {/* Minimized Map Link Button */}
              <Link
                to="/home/map"
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.985] shadow-sm ${isMapActive
                  ? "bg-emerald-700 text-white dark:bg-emerald-600"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500"
                  }`}
                onClick={closeMobileMenu}
              >
                <FaMapMarkedAlt className="text-sm" />
                {t("headingNav.open_live_map")}
              </Link>

              {/* Auth Section Box: Sign In, Sign Up, and Profile settings inside the Mobile Drawer */}
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-gray-900">
                {!initialized ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-9 bg-slate-100 dark:bg-gray-900 rounded-xl animate-pulse" />
                    <div className="flex-1 h-9 bg-slate-100 dark:bg-gray-900 rounded-xl animate-pulse" />
                  </div>
                ) : !user ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/login", { state: { background: resolveBackgroundLocation(location) } });
                        closeMobileMenu();
                      }}
                      className="flex-1 text-center rounded-xl border-2 border-emerald-600 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/50 transition-colors"
                    >
                      {t("Login.Login")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/register", { state: { background: resolveBackgroundLocation(location) } });
                        closeMobileMenu();
                      }}
                      className="flex-1 text-center rounded-xl bg-emerald-700 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-[0.985] truncate px-1"
                    >
                      {t("Register.join_medFinder")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2" ref={mobileProfileMenuRef}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-gray-900 transition-colors border border-slate-100 dark:border-gray-900"
                      onClick={() => setToggleProfileDropDown((o) => !o)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                        <FaUserCircle size={20} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-white truncate">{user?.Name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </button>

                    {toggleProfileDropDown && (
                      <div className="rounded-xl border border-slate-100 bg-white shadow-md dark:border-gray-900 dark:bg-gray-900 overflow-hidden text-xs">
                        <div className="px-3 py-2 border-b border-slate-50 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/50">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500">{t("headingNav.profile_dropdown.account")}</p>
                          <p className="truncate font-bold dark:text-white text-[11px]">{user?.email}</p>
                        </div>

                        {user.status === "inactive" ? (
                          <p className="px-3 py-2 text-red-500">{t("headingNav.profile_dropdown.inactive")}</p>
                        ) : (
                          <NavLink
                            to="#"
                            onClick={() => {
                              if (roles?.includes("patient")) {
                                navigate("/user/dashboard", { replace: true });
                              } else {
                                navigateByRole(roles, navigate);
                              }
                              setToggleProfileDropDown(false);
                              closeMobileMenu();
                            }}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800 font-bold"
                          >
                            <FaUser className="text-emerald-600 text-xs" />
                            <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                          </NavLink>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2.5 font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-50 dark:border-gray-800"
                        >
                          <LuLogOut className="text-xs" /> {t("headingNav.profile_dropdown.logout")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}