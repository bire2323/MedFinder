import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Image as ImageIcon, 
  LogOut, 
  AlertTriangle,
  Save,
  CheckCircle,
  Loader2,
  FileText,
  Navigation,
  Globe,
  Mail
} from "lucide-react";
import { useTranslation } from "react-i18next";
import WorkingHoursPicker from "./WorkingHoursPicker";
import useProfileUpdate from "../../hooks/useProfileUpdate";
import { getTheme } from "./ProfileSettings/utils/theme";

const ProfileSettings = ({ initialData, type = "pharmacy", onUpdateSuccess }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("general");
  const theme = getTheme(type);
  // Initialize formData with proper working_hour parsing
  const [formData, setFormData] = useState(() => {
    if (!initialData) return { addresses: [{}] };
    
    const data = { ...initialData };
    
    // Parse working_hour if it's a string from backend
    if (data.working_hour) {
      if (typeof data.working_hour === 'string') {
        try {
          data.working_hour = JSON.parse(data.working_hour);
        } catch (e) {
          console.error('Failed to parse working_hour:', e);
          data.working_hour = {};
        }
      }
      // If it's already an object, keep it as is
    } else {
      data.working_hour = {};
    }
    
    // Handle addresses
    if (!data.addresses || (Array.isArray(data.addresses) && data.addresses.length === 0)) {
      data.addresses = [{}];
    } else if (!Array.isArray(data.addresses)) {
      data.addresses = [data.addresses];
    }
    
    return data;
  });
  
 



  const [files, setFiles] = useState({});
  const [previewLogo, setPreviewLogo] = useState(initialData?.logo_url || null);
  const [isDirty, setIsDirty] = useState(false);

  const { updateProfile, loading, error, success } = useProfileUpdate(type, initialData?.id);

  // Update dirty state
  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData) || Object.keys(files).length > 0);
  }, [formData, files, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };
  // Add this function to handle address array updates
const updateAddressField = (index, field, value) => {
  setFormData(prev => {
    const addresses = [...(prev.addresses || [])];
    if (!addresses[index]) {
      addresses[index] = {};
    }
    addresses[index] = { ...addresses[index], [field]: value };
    return { ...prev, addresses };
  });
};

  const handleFileChange = (field, file) => {
    if (!file) return;
    setFiles(prev => ({ ...prev, [field]: file }));
    if (field === "logo") {
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const ok = await updateProfile(formData, files);
    if (ok && onUpdateSuccess){
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "center" });
       setFormData(initialData);
      onUpdateSuccess();
    }
  };

  const sections = [
    { id: "general", label: t("Settings.GeneralInfo"), icon: <Building2 size={18} /> },
    { id: "license", label: t("Settings.LicenseVerification"), icon: <ShieldCheck size={18} /> },
    { id: "contact", label: t("Settings.ContactInfo"), icon: <Phone size={18} /> },
    { id: "location", label: t("Settings.LocationAddress"), icon: <MapPin size={18} /> },
    { id: "availability", label: t("Settings.Availability"), icon: <Clock size={18} /> },
    { id: "media", label: t("Settings.MediaIdentity"), icon: <ImageIcon size={18} /> },
    { id: "danger", label: t("Settings.DangerZone"), icon: <AlertTriangle size={18} />, color: "text-red-500" },
  ];

  return (
    <div className="flex flex-col lg:sticky lg:top-4 lg:flex-row gap-8 min-h-screen pb-20">
      {/* Sidebar Navigation */}
      <nav className="lg:w-64 space-y-2 shrink-0 h-fit ">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
              activeSection === section.id
                ? `${theme.bgPrimary} text-white shadow-lg shadow-blue-500/20 translate-x-2`
                : `text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 ${section.color || ""}`
            }`}
          >
            {section.icon}
            <span className="text-sm">{section.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Sections */}
      <div className="flex-1 space-y-12 max-w-4xl">
        {/* Section: General Info */}
        <SectionWrapper id="general" title={t("Settings.GeneralInfo")} theme={theme}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label={t("Settings.FacilityNameEN")}
              value={formData.hospital_name_en || formData.pharmacy_name_en}
              onChange={(v) => handleChange(type === "hospital" ? "hospital_name_en" : "pharmacy_name_en", v)}
              error={type === "pharmacy" ? error?.pharmacy_name_en : error?.hospital_name_en}
            />
            <InputField
              label={t("Settings.FacilityNameAM")}
              value={formData.hospital_name_am || formData.pharmacy_name_am}
              onChange={(v) => handleChange(type === "hospital" ? "hospital_name_am" : "pharmacy_name_am", v)}
              placeholder="አይቤክስ አጠቃላይ ሆስፒታል"
              error={type === "pharmacy" ? error?.pharmacy_name_am : error?.hospital_name_am}
            />
            <SelectField
              label={t("Settings.OwnershipType")}
              value={type == "pharmacy" ? formData.pharmacy_license_category : formData.hospital_ownership_type}
              options={["Public", "Private", "NGO", "Other"]}
              onChange={(v) => handleChange(type == "pharmacy" ? "pharmacy_license_category" : "hospital_ownership_type", v)}
            />
          </div>
        </SectionWrapper>

        {/* Section: License */}
        <SectionWrapper id="license" title={t("Settings.LicenseVerification")} theme={theme}>
          <div className="bg-slate-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 mb-1">{t("Settings.LicenseNumber")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold">{formData.license_number || "PENDING"}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full border border-blue-200 uppercase">
                    {t("Settings.ReadOnly")}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                className={`${theme.textPrimary} text-xs font-bold hover:underline`}
                onClick={() => alert("Please contact admin@medfinder.com to update your license number.")}
              >
                {t("Settings.RequestUpdate")}
              </button>
            </div>
            <div className="mt-8">
               <FileInput
                  label={t("Settings.UploadLicense")}
                  icon={<FileText size={18} />}
                  onChange={(f) => handleFileChange("official_license_upload", f)}
                  currentFile={formData.license_document_url}
               />
            </div>
          </div>
        </SectionWrapper>

        {/* Section: Contact */}
        <SectionWrapper id="contact" title={t("Settings.ContactInfo")} theme={theme}> 
           <div className="flex flex-wrap">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label={t("Settings.EmergencyContact")}
                icon={<Phone size={14} />}
                value={formData.contact_phone}
                onChange={(v) => handleChange("contact_phone", v)}
                error={error?.contact_phone}
              />
             
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label={t("Settings.PublicEmail")}
                icon={<Mail size={14} />}
                value={formData.contact_email}
                onChange={(v) => handleChange("contact_email", v)}
                error={error?.contact_email}
              />
             
           </div>
           </div>
        </SectionWrapper>

        {/* Section: Location */}
        <SectionWrapper id="location" title={t("Settings.LocationAddress")} theme={theme}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                label={t("Settings.RegionEN")}
                value={formData.addresses[0]?.region_en || formData.addresses?.region_en}
                onChange={(v) => updateAddressField(0, "region_en", v)}
              />
              <InputField
                label={t("Settings.RegionAM")}
                value={formData.addresses[0]?.region_am || formData.addresses?.region_am}
                onChange={(v) => updateAddressField(0, "region_am", v)}
              />
               <InputField
                label={t("Settings.ZoneEn")}
                value={formData.addresses[0]?.zone_en || formData.addresses?.zone_en}
                onChange={(v) => updateAddressField(0, "zone_en", v)}
              />
               <InputField
                label={t("Settings.ZoneAm")}
                value={formData.addresses[0]?.zone_am || formData.addresses?.zone_am}
                onChange={(v) => updateAddressField(0, "zone_am", v)}
              />
              <InputField
                label={t("Settings.ZoneSubCityEn")}
                value={formData.addresses[0]?.sub_city_en || formData.addresses?.sub_city_en}
                onChange={(v) => updateAddressField(0, "sub_city_en", v)}
              />
               <InputField
                label={t("Settings.ZoneSubCityAm")}
                value={formData.addresses[0]?.sub_city_am || formData.addresses?.sub_city_am}
                onChange={(v) => updateAddressField(0, "sub_city_am", v)}
              />
              <InputField
                label={t("Settings.Kebele")}
                value={formData.addresses[0]?.kebele || formData.addresses?.kebele}
                onChange={(v) => updateAddressField(0, "kebele", v)}
              />
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black text-slate-400">{t("Settings.Coordinates")}</p>
                <button 
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((pos) => {
                       updateAddressField(0, "latitude", pos.coords.latitude);
                       updateAddressField(0, "longitude", pos.coords.longitude);
                    });
                  }}
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${theme.textPrimary} hover:${theme.textPrimary} transition-colors`}
                >
                  <Navigation size={12} /> {t("Settings.UseCurrentLocation")}
                </button>
              </div>
              <div className="h-64 bg-slate-100 dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-400 relative flex items-center justify-center">
                 {/* Map Placeholder: Actual Map Component would go here */}
                 <div className="text-center space-y-2 opacity-50">
                    <MapPin className="mx-auto text-blue-500" size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">{t("Settings.InteractiveMapActive")}</p>
                 </div>
                 <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputField
                    label={t("Settings.Latitude")}
                    value={formData.addresses[0]?.latitude}
                    onChange={(v) => updateAddressField(0, "latitude", v)}
                    error={error?.latitude}
                 />
                 <InputField
                    label={t("Settings.Longitude")}
                    value={formData.addresses[0]?.longitude}
                    onChange={(v) => updateAddressField(0, "longitude", v)}
                    error={error?.longitude}
                 />
              </div>
           </div>
        </SectionWrapper>

        {/* Section: Availability */}
        <SectionWrapper id="availability" title={t("Settings.Availability")} theme={theme}>
           <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-gray-800/50 rounded-3xl border border-gray-400 mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <Clock size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold">{t("Settings.FullTimeService")}</h4>
                    <p className="text-xs text-slate-500">{t("Settings.Operates247")}</p>
                 </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_full_time_service} 
                  onChange={(e) => handleChange("is_full_time_service", e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
           </div>
           
           {!formData.is_full_time_service && (
             <WorkingHoursPicker 
               value={formData.working_hour} 
               onChange={(v) => handleChange("working_hour", v)} 
             />
           )}
        </SectionWrapper>

        {/* Section: Media */}
        <SectionWrapper id="media" title={t("Settings.MediaIdentity")} theme={theme}>
           <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative group">
                 <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 group-hover:border-blue-400 transition-all">
                    {previewLogo ? (
                       <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                       <ImageIcon size={40} className="text-slate-300" />
                    )}
                 </div>
                 <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Save size={18} />
                    <input type="file" className="sr-only" onChange={(e) => handleFileChange("logo", e.target.files[0])} accept="image/*" />
                 </label>
              </div>
              <div className="flex-1 space-y-2">
                 <h4 className="font-bold">{t("Settings.FacilityLogo")}</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    {t("Settings.LogoDescription")}
                 </p>
                 <div className="flex gap-2 pt-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase">PNG, JPG</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase">1:1 Aspect</span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase">Max 2MB</span>
                 </div>
              </div>
           </div>
        </SectionWrapper>
<div id="result" className="bg-gray-200 p-4 flex justify-center items-center rounded-2xl">
    <div className="flex gap-2">
     {!success? (
<>
      <AlertTriangle className="text-red-500" size={24} />
      <p className="text-red-500 text-sm">{error}</p>
      
</>
     ):(
      <>
      <CheckCircle className="text-green-500" size={24} />
     {success === true && <p className="text-green-500 text-sm">updated Successfully!</p>} 
    
      </>
     )}
    </div>
</div>
        {/* Section: Danger Zone */}
        <div id="danger" className="pt-12 mt-12 border-t-2 border-dashed border-red-100 dark:border-red-900/20">
           <div className="bg-red-50/50 dark:bg-red-900/10 p-8 rounded-[3rem] border border-red-200 dark:border-red-900/30">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <AlertTriangle className="text-red-500" size={24} />
                       <h3 className="text-xl font-black uppercase text-red-600 tracking-tight">{t("Settings.DangerZone")}</h3>
                    </div>
                    <p className="text-sm text-red-700/70 dark:text-red-400 max-w-lg">
                       {t("Settings.DeactivationWarning")}
                    </p>
                 </div>
                 <button className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-xl shadow-red-500/20 transition-all flex items-center gap-2">
                    <LogOut size={16} /> {t("Settings.DeactivateProfile")}
                 </button>
              </div>
           </div>
        </div>

        {/* Floating Save Footer */}
        <AnimatePresence>
          {isDirty && (
            <motion.div 
               initial={{ y: 100 }} 
               animate={{ y: 0 }} 
               exit={{ y: 100 }}
               className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
            >
               <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl border border-blue-200 dark:border-gray-700 shadow-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                        <AlertTriangle size={20} />
                     </div>
                     <p className="text-sm font-bold truncate">{t("Settings.UnsavedChanges")}</p>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => { setFormData(initialData); setFiles({}); setPreviewLogo(initialData?.logo_url); }}
                        className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                     >
                        {t("Common.Discard")}
                     </button>
                     <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                     >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {t("Common.SaveUpdated")}
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Helper Components ---

const SectionWrapper = ({ id, title, children, theme }) => (
  <section id={id} className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-500 shadow-sm scroll-mt-24">
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-2 h-8 ${theme.bgPrimary} rounded-full`} />
      <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </section>
);

const InputField = ({ label, icon, value, onChange, placeholder, error }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2 ml-1">
      {icon} {label}
    </label>
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-4 bg-slate-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 transition-all ${
        error ? "focus:ring-red-500 bg-red-50 dark:bg-red-900/10" : "focus:ring-blue-500"
      }`}
    />
    {error && <p className="text-[9px] text-red-500 font-bold uppercase ml-1">{error}</p>}
  </div>
);

const SelectField = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">{label}</label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-slate-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    >
      <option value="">Select Option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
const FileInput = ({ label, icon, value, onChange, placeholder, error }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2 ml-1">
      {icon} {label}
    </label>
    <input
      type="file"
      value={value || ""}
      onChange={(e) => onChange(e.target.files[0])}
      placeholder={placeholder}
      className={`w-full p-4 bg-slate-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 transition-all ${
        error ? "focus:ring-red-500 bg-red-50 dark:bg-red-900/10" : "focus:ring-blue-500"
      }`}
    />
    {error && <p className="text-[9px] text-red-500 font-bold uppercase ml-1">{error}</p>}
  </div>
);


export default ProfileSettings;
