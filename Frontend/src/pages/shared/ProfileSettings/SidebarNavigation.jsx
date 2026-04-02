import React from "react";
import { Building2, ShieldCheck, Phone, MapPin, Clock, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const SidebarNavigation = ({ activeSection, onSectionClick, theme }) => {
  const { t } = useTranslation();
   console.log("initialData",theme);

  const sections = [
    { id: "general", label: t("Settings.GeneralInfo"), icon: <Building2 size={18} /> },
    { id: "license", label: t("Settings.LicenseVerification"), icon: <ShieldCheck size={18} /> },
    { id: "contact", label: t("Settings.ContactInfo"), icon: <Phone size={18} /> },
    { id: "location", label: t("Settings.LocationAddress"), icon: <MapPin size={18} /> },
    { id: "availability", label: t("Settings.Availability"), icon: <Clock size={18} /> },
    { id: "media", label: t("Settings.MediaIdentity"), icon: <ImageIcon size={18} /> },
    { id: "danger", label: t("Settings.DangerZone"), icon: <AlertTriangle size={18} />, color: "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10" },
  ];

  return (
    <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 lg:w-64 shrink-0 h-fit sticky top-4 snap-x no-scrollbar">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className={`flex-none lg:w-full flex items-center justify-center lg:justify-start gap-3 px-6 lg:px-4 py-4 rounded-3xl font-bold transition-all duration-300 snap-center ${
            activeSection === section.id
              ? `${theme.bgPrimary} text-white shadow-xl ${theme.shadowPrimary}/30 lg:translate-x-2`
              : `text-slate-500 bg-white/50 dark:bg-gray-800/20 lg:bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 ${section.color || ""}`
          }`}
        >
          {console.log("yooooooo",theme)}
          {section.icon}
          <span className="text-xs lg:text-sm tracking-wide whitespace-nowrap">{section.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
