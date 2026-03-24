import React from "react";
import { motion } from "framer-motion";
import { Camera, Store, Globe, Phone, Clock, Save } from "lucide-react";
import ThemeToggle from "../../../component/DarkLightTeam";

export const InputGroup = ({ label, icon, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2">
            {icon} {label}
        </label>
        <input
            value={value}
            onChange={onChange}
            className="w-full p-3 bg-slate-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
    </div>
);

export default function SettingsTab({ profile, setProfile }) {
    return (
        <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl space-y-8"
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-400 dark:border-gray-500 p-4 sm:p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 border-2 border-dashed border-emerald-300">
                        <Camera size={24} />
                    </div>
                    <h3 className="text-xl font-bold">Pharmacy Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                        label="Pharmacy Name"
                        icon={<Store size={14} />}
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                    <InputGroup
                        label="Support Email"
                        icon={<Globe size={14} />}
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                    <InputGroup
                        label="Phone"
                        icon={<Phone size={14} />}
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                    <InputGroup
                        label="Working Hours"
                        icon={<Clock size={14} />}
                        value={profile.openHours}
                        onChange={(e) => setProfile({ ...profile, openHours: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-4 items-center">
                <ThemeToggle />
                <button className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors">
                    <Save size={18} /> Update Settings
                </button>
            </div>
        </motion.div>
    );
}
