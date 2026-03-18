import React from "react";
import { Heart, Home, LogOut, MessageSquare, Search, User, Menu, X } from "lucide-react";

const navItems = [
  { key: "home", label: "Home", icon: Home },
  { key: "search", label: "Search", icon: Search },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: User },
];

export default function Sidebar({ activeSection, setActiveSection, onLogout, favoritesCount = 0 }) {
  const [open, setOpen] = React.useState(false);

  const handleNav = (key) => {
    setActiveSection(key);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-60 w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <Menu size={20} className="text-slate-700 dark:text-slate-200" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-55 lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={[
          "fixed top-0 left-0 z-56 lg:z-auto lg:sticky",
          "h-screen w-64 lg:w-64",
          "bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700",
          "transform transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              {/* simple dot icon substitute */}
              <span className="text-lg font-extrabold">+</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold">MedFinder</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                Patient Dashboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700"
            aria-label="Close navigation"
          >
            <X size={18} className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        <div className="px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeSection;
            const badge = item.key === "favorites" ? favoritesCount : null;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item.key)}
                className={[
                  "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl mb-2",
                  "transition-colors text-left",
                  active
                    ? "bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20"
                    : "hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-700 dark:text-slate-200 border border-transparent",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={[
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      active ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="font-extrabold">{item.label}</span>
                </span>

                {typeof badge === "number" && (
                  <span
                    className={[
                      "shrink-0 inline-flex items-center justify-center min-w-[28px] px-2 h-7 rounded-full text-xs font-extrabold",
                      active ? "bg-blue-600/20 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200",
                    ].join(" ")}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-4 border-t border-slate-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600/10 text-red-700 dark:text-red-300 hover:bg-red-600/15 transition-colors font-extrabold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}

