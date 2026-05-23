import { NavLink, Outlet } from "react-router-dom";
import { Map, MapPin, User } from "lucide-react";

const navItems = [
    {
        id: "profile",
        label: "Profile",
        path: "profile",
        icon: User,
        colorClass: "text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-800",
        activeClass: "bg-slate-900 text-white dark:bg-white/10",
    },
    {
        id: "region",
        label: "Region",
        path: "region",
        icon: Map,
        colorClass: "text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-950/20",
        activeClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    },
    {
        id: "city",
        label: "City",
        path: "city",
        icon: MapPin,
        colorClass: "text-emerald-700 bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-950/20",
        activeClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    },
];

export default function AdminSettingsLayout() {
    return (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none lg:sticky lg:top-10 lg:self-start">
                <div className="mb-6">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Settings</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Configure admin profile, region, and city management.</p>
                </div>

                <div className="space-y-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-3xl border px-4 py-3 transition-all duration-200 ${isActive ? item.activeClass : `${item.colorClass} border-transparent hover:border-slate-200 dark:hover:border-slate-700`
                                    }`
                                }
                            >
                                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.colorClass} transition-transform duration-200 group-hover:scale-105`}>
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.id === 'profile' ? 'Profile settings' : `Manage ${item.label.toLowerCase()}`}</p>
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </aside>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-none">
                <Outlet />
            </section>
        </div>
    );
}
