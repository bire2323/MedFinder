import { Heart, Home, LogOut, MessageSquare, MapPin, User, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
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
        className="lg:hidden fixed top-14 left-0 z-[150] w-6 h-6 rounded-r-3xl bg-white/95 dark:bg-gray-800/95 border border-slate-200 dark:border-gray-700 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label={t("UserDashboard.OpenNavigation")}
      >
        <ChevronRight size={16} className="text-slate-700 dark:text-slate-200" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={[
          "fixed top-0 left-0 z-[999] lg:z-auto lg:sticky",
          "h-screen w-64 lg:w-64",
          "bg-white/95 dark:bg-gray-800/95 border-r border-slate-200 dark:border-gray-700",
          "transform transition-transform duration-200 ease-in-out",
          open ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="p-4 border border-slate-200 dark:border-gray-700 mt-2 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <span className="text-lg font-bold">+</span>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300 mt-0.5 uppercase tracking-wide">
                {t("UserDashboard.YourHealthcareDashboard")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700"
            aria-label={t("Common.Cancel")}
          >
            <X size={18} className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-2 border rounded-xl mt-4 border-slate-200 dark:border-gray-700">
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
                  "w-full flex items-center justify-between gap-1 md:gap-3 px-4 py-2 md:py-3 rounded-xl md:rounded-2xl mb-1 md:mb-2",
                  "transition-colors text-left",
                  isActive
                    ? "bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20"
                    : "hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-700 dark:text-slate-200 border border-transparent",
                ].join(" ")}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          "w-9 h-9 rounded-xl flex items-center justify-center",
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="text-sm md:font-bold">{item.label}</span>
                    </span>

                    {badge !== null && (
                      <span
                        className={[
                          "shrink-0 inline-flex items-center justify-center min-w-[28px] px-1 md:px-2 h-4 md:h-7 rounded-full text-xs font-bold",
                          isUnreadBadge
                            ? "bg-red-500 text-white"
                            : (isActive ? "bg-blue-600/20 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200")
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

        <div className="mt-auto p-4 border-t border-slate-200 dark:border-gray-700 bg-gradient-to-t from-transparent to-white/50 dark:to-gray-800/40">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-700 dark:text-red-300 hover:bg-red-600/15 transition-colors text-sm md:font-bold"
          >
            <LogOut size={18} />
            {t("headingNav.profile_dropdown.logout")}
          </button>
        </div>
      </nav>
    </>
  );
}


