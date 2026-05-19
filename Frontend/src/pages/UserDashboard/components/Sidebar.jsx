import { Heart, Home, LogOut, MessageSquare, MapPin, User, X, ChevronRight, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ onLogout, favoritesCount = 0, unreadCount = 0 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { icon: Home, label: t("UserDashboard.Overview"), path: "/user/dashboard/overview" },
    { icon: MapPin, label: t("UserDashboard.SearchAndNavigate"), path: "/user/dashboard/search" },
    { icon: Heart, label: t("UserDashboard.SavedPlaces"), path: "/user/dashboard/favorites" },
    { icon: MessageSquare, label: t("UserDashboard.Messages"), path: "/user/dashboard/messages" },
    { icon: User, label: t("UserDashboard.Profile"), path: "/user/dashboard/profile" },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 right-6 z-[100] w-10 h-10 rounded-2xl bg-white/95 dark:bg-gray-900/95 border-y border-r border-slate-200 dark:border-gray-800 shadow-md flex items-center justify-center transition-all hover:translate-x-0.5"
        aria-label={t("UserDashboard.OpenNavigation")}
      >
        <Menu size={18} className="text-slate-600 dark:text-slate-300" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[990] lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={[
          "fixed top-0 left-0 z-[995] lg:z-auto lg:sticky",
          "h-screen w-64 lg:w-64 flex flex-col justify-between",
          "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-r border-slate-100 dark:border-gray-900",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <span className="text-xl font-bold">+</span>
            </div>
            <div className="leading-tight">
              <h2 className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                MedFinder
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                {t("UserDashboard.YourHealthcareDashboard")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-slate-400"
            aria-label={t("Common.Cancel")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            let badge = null;
            let isUnreadBadge = false;

            if (item.path.includes("favorites") && favoritesCount > 0) badge = favoritesCount;
            if (item.path.includes("messages") && unreadCount > 0) {
              badge = unreadCount;
              isUnreadBadge = true;
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => [
                  "group w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl mb-1.5",
                  "transition-all duration-200 text-left border-l-4",
                  isActive
                    ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border-emerald-500 shadow-sm"
                    : "hover:bg-slate-50/80 dark:hover:bg-gray-900/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-transparent",
                ].join(" ")}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "bg-slate-50 dark:bg-gray-900/50 text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-gray-800/80 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                        ].join(" ")}
                      >
                        <Icon size={18} className="transition-transform group-hover:scale-105" />
                      </span>
                      <span className="text-sm font-medium tracking-wide">{item.label}</span>
                    </span>

                    {badge !== null && (
                      <span
                        className={[
                          "shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold transition-all duration-200",
                          isUnreadBadge
                            ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20 animate-pulse"
                            : (isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300")
                        ].join(" ")}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-gray-900/80">
          <button
            type="button"
            onClick={onLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all duration-200 text-sm font-semibold shadow-sm"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-0.5" />
            <span>{t("headingNav.profile_dropdown.logout")}</span>
          </button>
        </div>
      </nav>
    </>
  );
}



