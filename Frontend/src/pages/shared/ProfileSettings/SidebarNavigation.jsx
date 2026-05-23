import React from "react";
import { Building2, ShieldCheck, Phone, MapPin, Clock, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const SidebarNavigation = ({ activeSection, onSectionClick, theme }) => {
  const { t } = useTranslation();

  const sections = [
    { id: "general", label: t("Settings.GeneralInfo"), icon: <Building2 size={16} /> },
    { id: "license", label: t("Settings.LicenseVerification"), icon: <ShieldCheck size={16} /> },
    { id: "contact", label: t("Settings.ContactInfo"), icon: <Phone size={16} /> },
    { id: "location", label: t("Settings.LocationAddress"), icon: <MapPin size={16} /> },
    { id: "availability", label: t("Settings.Availability"), icon: <Clock size={16} /> },
    { id: "media", label: t("Settings.MediaIdentity"), icon: <ImageIcon size={16} /> },
    { id: "danger", label: t("Settings.DangerZone"), icon: <AlertTriangle size={16} />, color: "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10" },
  ];

  return (
    <nav className="flex flex-wrap lg:flex-col gap-1.5 overflow-x-scroll pb-4 lg:pb-0 lg:w-64 shrink-0 h-fit sticky top-4 snap-x no-scrollbar">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className="relative flex-none lg:w-full flex items-center justify-center lg:justify-start gap-3 px-5 lg:px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 snap-center cursor-pointer active:scale-95 overflow-hidden"
        >
          {activeSection === section.id && (
            <motion.span
              layoutId="activeSettingsTab"
              className={`absolute inset-0 bg-gradient-to-r ${theme?.name === 'emerald' ? 'from-emerald-500 to-green-600' : 'from-blue-500 to-indigo-600'} shadow-lg ${theme?.name === 'emerald' ? 'shadow-emerald-500/15' : 'shadow-blue-500/15'} rounded-2xl`}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className={`relative z-10 flex items-center gap-3 ${activeSection === section.id
              ? "text-white"
              : `text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-450 ${section.color || ""}`
            }`}>
            {section.icon}
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">{section.label}</span>
          </span>
        </button>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
