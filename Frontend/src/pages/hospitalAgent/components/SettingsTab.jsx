import React from "react";
import { motion } from "framer-motion";
import { Camera, Building2, Globe, Phone, Save } from "lucide-react";
import ThemeToggle from "../../../component/DarkLightTeam";

export const InputGroup = ({ label, icon, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">
      {icon} {label}
    </label>
    <input
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500/40 transition-all font-semibold text-xs text-slate-705 dark:text-white"
    />
  </div>
);

export default function SettingsTab({ profile, setProfile }) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100/30">
            <Camera size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-805 dark:text-white leading-tight">Hospital Identity</h3>
            <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs mt-0.5">Manage key information of the facility.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup
            label="Hospital Name"
            icon={<Building2 size={12} />}
            value={profile?.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <InputGroup
            label="Email"
            icon={<Globe size={12} />}
            value={profile?.email || ""}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <InputGroup
            label="Phone"
            icon={<Phone size={12} />}
            value={profile?.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <InputGroup
            label="Address"
            icon={<Building2 size={12} />}
            value={profile?.address || ""}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 items-center">
        <ThemeToggle />
        <button className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 flex items-center gap-2 cursor-pointer">
          <Save size={14} /> Update Settings
        </button>
      </div>
    </motion.div>
  );
}
